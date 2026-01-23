import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";

// Admin-only procedure middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

// Member-only procedure (has active membership)
const memberProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const membership = await db.getActiveMembership(ctx.user.id);
  if (!membership && ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Active membership required' });
  }
  return next({ ctx: { ...ctx, membership } });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Membership procedures
  membership: router({
    // Check current user's membership status
    status: protectedProcedure.query(async ({ ctx }) => {
      const membership = await db.getActiveMembership(ctx.user.id);
      return {
        hasMembership: !!membership || ctx.user.role === 'admin',
        membership,
        isAdmin: ctx.user.role === 'admin',
      };
    }),
    
    // Get user's membership history
    history: protectedProcedure.query(async ({ ctx }) => {
      return db.getMembershipsByUserId(ctx.user.id);
    }),
    
    // Create membership after payment (called by webhook or manual)
    create: protectedProcedure
      .input(z.object({
        stripeCustomerId: z.string().optional(),
        stripeSubscriptionId: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const now = new Date();
        const endDate = new Date(now);
        endDate.setFullYear(endDate.getFullYear() + 1); // 1 year membership
        
        await db.createMembership({
          userId: ctx.user.id,
          status: "active",
          startDate: now,
          endDate,
          stripeCustomerId: input.stripeCustomerId || null,
          stripeSubscriptionId: input.stripeSubscriptionId || null,
          amount: 9700, // $97 in cents
        });
        
        return { success: true };
      }),
  }),

  // Blog procedures
  blog: router({
    // Public: Get published posts
    list: publicProcedure
      .input(z.object({
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      }).optional())
      .query(async ({ input }) => {
        const { limit = 20, offset = 0 } = input || {};
        return db.getPublishedBlogPosts(limit, offset);
      }),
    
    // Public: Get single post by slug
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const post = await db.getBlogPostBySlug(input.slug);
        if (!post || !post.isPublished) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Post not found' });
        }
        // Increment view count
        await db.incrementBlogViewCount(post.id);
        return post;
      }),
    
    // Admin: Get all posts (including unpublished)
    adminList: adminProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional())
      .query(async ({ input }) => {
        const { limit = 50, offset = 0 } = input || {};
        return db.getAllBlogPosts(limit, offset);
      }),
    
    // Admin: Create post
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
    
    // Admin: Update post
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
        
        // If publishing for first time, set publishedAt
        if (updates.isPublished) {
          const existingPost = await db.getBlogPostById(id);
          if (existingPost && !existingPost.publishedAt) {
            (updates as any).publishedAt = new Date();
          }
        }
        
        await db.updateBlogPost(id, updates);
        return { success: true };
      }),
    
    // Admin: Delete post
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteBlogPost(input.id);
        return { success: true };
      }),
    
    // Admin: Bulk seed posts
    bulkCreate: adminProcedure
      .input(z.array(z.object({
        slug: z.string().min(1),
        title: z.string().min(1),
        excerpt: z.string().optional(),
        content: z.string().min(1),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        featuredImage: z.string().optional(),
        category: z.string().optional(),
        tags: z.string().optional(),
        isPublished: z.boolean().default(true),
        publishedAt: z.string().optional(),
      })))
      .mutation(async ({ ctx, input }) => {
        let created = 0;
        for (const post of input) {
          try {
            await db.createBlogPost({
              ...post,
              authorId: ctx.user.id,
              publishedAt: post.publishedAt ? new Date(post.publishedAt) : (post.isPublished ? new Date() : null),
            });
            created++;
          } catch (e) {
            console.error(`Failed to create post: ${post.slug}`, e);
          }
        }
        return { success: true, created };
      }),
    
    // Admin: Publish scheduled posts
    publishScheduled: adminProcedure.mutation(async () => {
      const count = await db.publishScheduledPosts();
      return { published: count };
    }),
  }),

  // Email subscriber procedures
  subscriber: router({
    // Public: Subscribe
    subscribe: publicProcedure
      .input(z.object({
        email: z.string().email(),
        source: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await db.addEmailSubscriber({
          email: input.email,
          source: input.source || 'website',
          status: 'subscribed',
        });
        return result;
      }),
    
    // Admin: List subscribers
    list: adminProcedure
      .input(z.object({
        status: z.enum(['pending', 'subscribed', 'unsubscribed']).optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.getEmailSubscribers(input?.status);
      }),
  }),

  // Admin procedures
  admin: router({
    // Get all users
    users: adminProcedure.query(async () => {
      return db.getAllUsers();
    }),
    
    // Update user role
    updateUserRole: adminProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(['user', 'admin']),
      }))
      .mutation(async ({ input }) => {
        await db.updateUserRole(input.userId, input.role);
        return { success: true };
      }),
    
    // Grant membership to user (admin override)
    grantMembership: adminProcedure
      .input(z.object({
        userId: z.number(),
        durationMonths: z.number().min(1).max(24).default(12),
      }))
      .mutation(async ({ input }) => {
        const now = new Date();
        const endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + input.durationMonths);
        
        await db.createMembership({
          userId: input.userId,
          status: "active",
          startDate: now,
          endDate,
          amount: 0, // Admin granted
        });
        
        return { success: true };
      }),
  }),

  // Member-only content
  members: router({
    // Get vetted vendors list (members only)
    vendors: memberProcedure.query(async () => {
      // This would typically come from a database, but for now return static content
      return {
        amanita: [
          { name: "Forest Wisdom Co.", rating: 4.9, verified: true, specialty: "Dried Amanita Muscaria caps" },
          { name: "Northern Roots", rating: 4.8, verified: true, specialty: "Microdose preparations" },
          { name: "Ancient Path Botanicals", rating: 4.7, verified: true, specialty: "Tinctures and extracts" },
        ],
        psilocybin: [
          { name: "Sacred Spores", rating: 4.9, verified: true, specialty: "Cultivation supplies" },
          { name: "Mycelium Masters", rating: 4.8, verified: true, specialty: "Grow kits" },
          { name: "Fungi Friends", rating: 4.7, verified: true, specialty: "Educational resources" },
        ],
      };
    }),
    
    // Get exclusive guides (members only)
    guides: memberProcedure.query(async () => {
      return [
        { id: 1, title: "The Beginner's Guide to Safe Microdosing", category: "Basics" },
        { id: 2, title: "Amanita Muscaria: Preparation & Dosing", category: "Amanita" },
        { id: 3, title: "Integration: Making Your Experience Last", category: "Integration" },
        { id: 4, title: "Set & Setting: Creating Sacred Space", category: "Preparation" },
        { id: 5, title: "Working with Psilocybin for Trauma", category: "Psilocybin" },
      ];
    }),
  }),
});

export type AppRouter = typeof appRouter;
