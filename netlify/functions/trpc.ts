import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { parse as parseCookieHeader, serialize } from "cookie";
import { jwtVerify } from "jose";
import { z } from "zod";
import "dotenv/config";

// Import database and schema
import * as db from "../../server/db";
import type { User } from "../../drizzle/schema";
import { COOKIE_NAME, UNAUTHED_ERR_MSG, NOT_ADMIN_ERR_MSG } from "../../shared/const";

// Environment
const JWT_SECRET = process.env.JWT_SECRET || "";

// Context type for serverless
type ServerlessContext = {
  user: User | null;
  cookies: Record<string, string>;
  setCookieHeaders: string[];
};

// Helper functions
function getSessionSecret() {
  return new TextEncoder().encode(JWT_SECRET);
}

async function verifySession(cookieValue: string | undefined | null): Promise<{ openId: string; appId: string; name: string } | null> {
  if (!cookieValue) return null;
  try {
    const secretKey = getSessionSecret();
    const { payload } = await jwtVerify(cookieValue, secretKey, { algorithms: ["HS256"] });
    const { openId, appId, name } = payload as Record<string, unknown>;
    if (typeof openId !== "string" || typeof appId !== "string" || typeof name !== "string") return null;
    return { openId, appId, name };
  } catch {
    return null;
  }
}

// Initialize tRPC for serverless
const t = initTRPC.context<ServerlessContext>().create({
  transformer: superjson,
});

const router = t.router;
const publicProcedure = t.procedure;

const requireUser = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

const protectedProcedure = t.procedure.use(requireUser);

const adminProcedure = t.procedure.use(
  t.middleware(async ({ ctx, next }) => {
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  })
);

const memberProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const membership = await db.getActiveMembership(ctx.user.id);
  if (!membership && ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Active membership required" });
  }
  return next({ ctx: { ...ctx, membership } });
});

// Recreate the app router for serverless
const appRouter = router({
  auth: router({
    me: publicProcedure.query(({ ctx }) => ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      // For serverless, we can't set cookies directly - client should handle this
      return { success: true };
    }),
  }),

  membership: router({
    status: protectedProcedure.query(async ({ ctx }) => {
      const membership = await db.getActiveMembership(ctx.user.id);
      return {
        hasMembership: !!membership || ctx.user.role === "admin",
        membership,
        isAdmin: ctx.user.role === "admin",
      };
    }),
    history: protectedProcedure.query(async ({ ctx }) => {
      return db.getMembershipsByUserId(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({
        stripeCustomerId: z.string().optional(),
        stripeSubscriptionId: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const now = new Date();
        const endDate = new Date(now);
        endDate.setFullYear(endDate.getFullYear() + 1);
        await db.createMembership({
          userId: ctx.user.id,
          status: "active",
          startDate: now,
          endDate,
          stripeCustomerId: input.stripeCustomerId || null,
          stripeSubscriptionId: input.stripeSubscriptionId || null,
          amount: 9700,
        });
        return { success: true };
      }),
  }),

  blog: router({
    list: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(50).default(20), offset: z.number().min(0).default(0) }).optional())
      .query(async ({ input }) => {
        const { limit = 20, offset = 0 } = input || {};
        return db.getPublishedBlogPosts(limit, offset);
      }),
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const post = await db.getBlogPostBySlug(input.slug);
        if (!post || !post.isPublished) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
        }
        await db.incrementBlogViewCount(post.id);
        return post;
      }),
    adminList: adminProcedure
      .input(z.object({ limit: z.number().min(1).max(100).default(50), offset: z.number().min(0).default(0) }).optional())
      .query(async ({ input }) => {
        const { limit = 50, offset = 0 } = input || {};
        return db.getAllBlogPosts(limit, offset);
      }),
    create: adminProcedure
      .input(z.object({
        slug: z.string().min(1),
        title: z.string().min(1),
        excerpt: z.string().optional(),
        content: z.string().min(1),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        featuredImage: z.string().optional(),
        category: z.string().optional(),
        tags: z.string().optional(),
        isPublished: z.boolean().default(false),
        scheduledFor: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.createBlogPost({
          ...input,
          authorId: ctx.user.id,
          publishedAt: input.isPublished ? new Date() : null,
        });
        return { success: true };
      }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        slug: z.string().min(1).optional(),
        title: z.string().min(1).optional(),
        excerpt: z.string().optional(),
        content: z.string().min(1).optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        featuredImage: z.string().optional(),
        category: z.string().optional(),
        tags: z.string().optional(),
        isPublished: z.boolean().optional(),
        scheduledFor: z.date().nullable().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        if (updates.isPublished) {
          const existingPost = await db.getBlogPostById(id);
          if (existingPost && !existingPost.publishedAt) {
            (updates as any).publishedAt = new Date();
          }
        }
        await db.updateBlogPost(id, updates);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteBlogPost(input.id);
        return { success: true };
      }),
  }),

  subscriber: router({
    subscribe: publicProcedure
      .input(z.object({
        email: z.string().email(),
        firstName: z.string().optional(),
        source: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await db.addEmailSubscriber({
          email: input.email,
          firstName: input.firstName || null,
          source: input.source || "website",
          status: "subscribed",
        });
        return result;
      }),
    list: adminProcedure
      .input(z.object({ status: z.enum(["pending", "subscribed", "unsubscribed"]).optional() }).optional())
      .query(async ({ input }) => {
        return db.getEmailSubscribers(input?.status);
      }),
  }),

  profile: router({
    me: protectedProcedure.query(async ({ ctx }) => {
      return db.getMemberProfileByUserId(ctx.user.id);
    }),
    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const profile = await db.getMemberProfileById(input.id);
        if (!profile || !profile.isPublic) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found" });
        }
        return profile;
      }),
    count: publicProcedure.query(async () => {
      return db.getMemberProfileCount();
    }),
    create: protectedProcedure
      .input(z.object({
        displayName: z.string().min(2).max(50),
        avatarIcon: z.string().default("mushroom-1"),
        avatarColor: z.string().default("#8B5CF6"),
        bio: z.string().max(500).optional(),
        journeyStage: z.enum(["researching", "preparing", "started", "experienced", "guide"]).default("researching"),
        joinReasons: z.array(z.string()).optional(),
        isPublic: z.boolean().default(true),
      }))
      .mutation(async ({ ctx, input }) => {
        const existing = await db.getMemberProfileByUserId(ctx.user.id);
        if (existing) {
          throw new TRPCError({ code: "CONFLICT", message: "Profile already exists" });
        }
        await db.createMemberProfile({
          userId: ctx.user.id,
          displayName: input.displayName,
          avatarIcon: input.avatarIcon,
          avatarColor: input.avatarColor,
          bio: input.bio || null,
          journeyStage: input.journeyStage,
          joinReasons: input.joinReasons ? JSON.stringify(input.joinReasons) : null,
          isPublic: input.isPublic,
        });
        return { success: true };
      }),
    update: protectedProcedure
      .input(z.object({
        displayName: z.string().min(2).max(50).optional(),
        avatarIcon: z.string().optional(),
        avatarColor: z.string().optional(),
        bio: z.string().max(500).optional(),
        journeyStage: z.enum(["researching", "preparing", "started", "experienced", "guide"]).optional(),
        joinReasons: z.array(z.string()).optional(),
        isPublic: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const updates: any = { ...input };
        if (input.joinReasons) {
          updates.joinReasons = JSON.stringify(input.joinReasons);
        }
        await db.updateMemberProfile(ctx.user.id, updates);
        return { success: true };
      }),
  }),

  spaces: router({
    list: publicProcedure.query(async () => {
      return db.getCommunitySpaces();
    }),
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const space = await db.getCommunitySpaceBySlug(input.slug);
        if (!space) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Space not found" });
        }
        return space;
      }),
  }),

  posts: router({
    recent: publicProcedure
      .input(z.object({ limit: z.number().min(1).max(50).default(20), offset: z.number().min(0).default(0) }).optional())
      .query(async ({ input }) => {
        const { limit = 20, offset = 0 } = input || {};
        const posts = await db.getRecentCommunityPosts(limit, offset);
        const enrichedPosts = await Promise.all(posts.map(async (post) => {
          const author = await db.getMemberProfileById(post.authorId);
          const space = await db.getCommunitySpaceById(post.spaceId);
          return { ...post, author, space };
        }));
        return enrichedPosts;
      }),
    bySpace: publicProcedure
      .input(z.object({ spaceId: z.number(), limit: z.number().min(1).max(50).default(20), offset: z.number().min(0).default(0) }))
      .query(async ({ input }) => {
        const posts = await db.getCommunityPostsBySpace(input.spaceId, input.limit, input.offset);
        const enrichedPosts = await Promise.all(posts.map(async (post) => {
          const author = await db.getMemberProfileById(post.authorId);
          return { ...post, author };
        }));
        return enrichedPosts;
      }),
    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const post = await db.getCommunityPostById(input.id);
        if (!post) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Post not found" });
        }
        await db.incrementPostViewCount(input.id);
        const author = await db.getMemberProfileById(post.authorId);
        const space = await db.getCommunitySpaceById(post.spaceId);
        const comments = await db.getPostComments(post.id);
        const enrichedComments = await Promise.all(comments.map(async (comment) => {
          const commentAuthor = await db.getMemberProfileById(comment.authorId);
          return { ...comment, author: commentAuthor };
        }));
        return { ...post, author, space, comments: enrichedComments };
      }),
    create: protectedProcedure
      .input(z.object({ spaceId: z.number(), title: z.string().max(300).optional(), content: z.string().min(1), isAnonymous: z.boolean().default(false) }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getMemberProfileByUserId(ctx.user.id);
        if (!profile) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Create a profile first" });
        }
        await db.createCommunityPost({ spaceId: input.spaceId, authorId: profile.id, title: input.title || "", content: input.content });
        return { success: true };
      }),
    toggleLike: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getMemberProfileByUserId(ctx.user.id);
        if (!profile) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Create a profile first" });
        }
        const hasLiked = await db.hasUserLikedPost(profile.id, input.postId);
        if (hasLiked) {
          await db.removePostLike(profile.id, input.postId);
          return { liked: false };
        } else {
          await db.addPostLike({ profileId: profile.id, postId: input.postId });
          return { liked: true };
        }
      }),
  }),

  comments: router({
    byPost: publicProcedure
      .input(z.object({ postId: z.number() }))
      .query(async ({ input }) => {
        const comments = await db.getPostComments(input.postId);
        const enrichedComments = await Promise.all(comments.map(async (comment) => {
          const author = await db.getMemberProfileById(comment.authorId);
          return { ...comment, author };
        }));
        return enrichedComments;
      }),
    create: protectedProcedure
      .input(z.object({ postId: z.number(), content: z.string().min(1), parentId: z.number().optional(), isAnonymous: z.boolean().default(false) }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getMemberProfileByUserId(ctx.user.id);
        if (!profile) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Create a profile first" });
        }
        await db.createPostComment({ postId: input.postId, authorId: profile.id, content: input.content });
        return { success: true };
      }),
  }),

  vendorCategories: router({
    list: publicProcedure.query(async () => db.getVendorCategories()),
    adminList: adminProcedure.query(async () => db.getAllVendorCategories()),
  }),

  vendors: router({
    list: memberProcedure
      .input(z.object({ categoryId: z.number().optional() }).optional())
      .query(async ({ input }) => db.getVendors(input?.categoryId)),
    featured: publicProcedure.query(async () => db.getFeaturedVendors()),
    verified: memberProcedure.query(async () => db.getVerifiedVendors()),
    bySlug: memberProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const vendor = await db.getVendorBySlug(input.slug);
        if (!vendor) throw new TRPCError({ code: "NOT_FOUND", message: "Vendor not found" });
        return vendor;
      }),
    byId: memberProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const vendor = await db.getVendorById(input.id);
        if (!vendor) throw new TRPCError({ code: "NOT_FOUND", message: "Vendor not found" });
        return vendor;
      }),
    adminList: adminProcedure.query(async () => db.getAllVendors()),
  }),

  resourceCategories: router({
    list: publicProcedure.query(async () => db.getResourceCategories()),
    adminList: adminProcedure.query(async () => db.getAllResourceCategories()),
  }),

  resources: router({
    list: publicProcedure
      .input(z.object({ categoryId: z.number().optional() }).optional())
      .query(async ({ input }) => db.getResources(input?.categoryId)),
    featured: publicProcedure.query(async () => db.getFeaturedResources()),
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const resource = await db.getResourceBySlug(input.slug);
        if (!resource) throw new TRPCError({ code: "NOT_FOUND", message: "Resource not found" });
        return resource;
      }),
    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const resource = await db.getResourceById(input.id);
        if (!resource) throw new TRPCError({ code: "NOT_FOUND", message: "Resource not found" });
        return resource;
      }),
    adminList: adminProcedure.query(async () => db.getAllResources()),
  }),

  members: router({
    vendors: memberProcedure.query(async () => db.getVerifiedVendors()),
    guides: memberProcedure.query(async () => db.getFeaturedResources()),
  }),
});

export type AppRouter = typeof appRouter;

// Create context from request
async function createContext(req: Request): Promise<ServerlessContext> {
  let user: User | null = null;
  const cookies: Record<string, string> = {};

  try {
    const cookieHeader = req.headers.get("cookie");
    if (cookieHeader) {
      const parsedCookies = parseCookieHeader(cookieHeader);
      Object.assign(cookies, parsedCookies);
      const sessionCookie = parsedCookies[COOKIE_NAME];
      const session = await verifySession(sessionCookie);
      if (session) {
        user = (await db.getUserByOpenId(session.openId)) || null;
      }
    }
  } catch {
    user = null;
  }

  return { user, cookies, setCookieHeaders: [] };
}

// Netlify Handler
export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const url = new URL(event.rawUrl);
  const headers = new Headers();
  Object.entries(event.headers || {}).forEach(([key, value]) => {
    if (value) headers.set(key, value);
  });

  const request = new Request(url, {
    method: event.httpMethod,
    headers,
    body: event.body ? event.body : undefined,
  });

  try {
    const response = await fetchRequestHandler({
      endpoint: "/.netlify/functions/trpc",
      req: request,
      router: appRouter,
      createContext: () => createContext(request),
    });

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return {
      statusCode: response.status,
      headers: responseHeaders,
      body: await response.text(),
    };
  } catch (error) {
    console.error("tRPC handler error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
