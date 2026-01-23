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
    status: protectedProcedure.query(async ({ ctx }) => {
      const membership = await db.getActiveMembership(ctx.user.id);
      return {
        hasMembership: !!membership || ctx.user.role === 'admin',
        membership,
        isAdmin: ctx.user.role === 'admin',
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

  // Blog procedures
  blog: router({
    list: publicProcedure
      .input(z.object({
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      }).optional())
      .query(async ({ input }) => {
        const { limit = 20, offset = 0 } = input || {};
        return db.getPublishedBlogPosts(limit, offset);
      }),
    
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const post = await db.getBlogPostBySlug(input.slug);
        if (!post || !post.isPublished) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Post not found' });
        }
        await db.incrementBlogViewCount(post.id);
        return post;
      }),
    
    adminList: adminProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }).optional())
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
    
    publishScheduled: adminProcedure.mutation(async () => {
      const count = await db.publishScheduledPosts();
      return { published: count };
    }),
  }),

  // Email subscriber procedures
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
          source: input.source || 'website',
          status: 'subscribed',
        });
        return result;
      }),
    
    list: adminProcedure
      .input(z.object({
        status: z.enum(['pending', 'subscribed', 'unsubscribed']).optional(),
      }).optional())
      .query(async ({ input }) => {
        return db.getEmailSubscribers(input?.status);
      }),
  }),

  // Member Profile procedures
  profile: router({
    // Get current user's profile
    me: protectedProcedure.query(async ({ ctx }) => {
      return db.getMemberProfileByUserId(ctx.user.id);
    }),
    
    // Get profile by ID
    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const profile = await db.getMemberProfileById(input.id);
        if (!profile || !profile.isPublic) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Profile not found' });
        }
        return profile;
      }),
    
    // Get member count
    count: publicProcedure.query(async () => {
      return db.getMemberProfileCount();
    }),
    
    // Create profile
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
        // Check if profile already exists
        const existing = await db.getMemberProfileByUserId(ctx.user.id);
        if (existing) {
          throw new TRPCError({ code: 'CONFLICT', message: 'Profile already exists' });
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
    
    // Update profile
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

  // Community Spaces procedures
  spaces: router({
    // List all spaces
    list: publicProcedure.query(async () => {
      return db.getCommunitySpaces();
    }),
    
    // Get space by slug
    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const space = await db.getCommunitySpaceBySlug(input.slug);
        if (!space) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Space not found' });
        }
        return space;
      }),
    
    // Admin: Create space
    create: adminProcedure
      .input(z.object({
        name: z.string().min(1).max(100),
        slug: z.string().min(1).max(100),
        description: z.string().optional(),
        color: z.string().default("#8B5CF6"),
        icon: z.string().default("message-circle"),

        sortOrder: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        await db.createCommunitySpace(input);
        return { success: true };
      }),
  }),

  // Community Posts procedures
  posts: router({
    // Get recent posts
    recent: publicProcedure
      .input(z.object({
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      }).optional())
      .query(async ({ input }) => {
        const { limit = 20, offset = 0 } = input || {};
        const posts = await db.getRecentCommunityPosts(limit, offset);
        
        // Enrich with author and space data
        const enrichedPosts = await Promise.all(posts.map(async (post) => {
          const author = await db.getMemberProfileById(post.authorId);
          const space = await db.getCommunitySpaceById(post.spaceId);
          return { ...post, author, space };
        }));
        
        return enrichedPosts;
      }),
    
    // Get posts by space
    bySpace: publicProcedure
      .input(z.object({
        spaceId: z.number(),
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ input }) => {
        const posts = await db.getCommunityPostsBySpace(input.spaceId, input.limit, input.offset);
        
        const enrichedPosts = await Promise.all(posts.map(async (post) => {
          const author = await db.getMemberProfileById(post.authorId);
          return { ...post, author };
        }));
        
        return enrichedPosts;
      }),
    
    // Get single post
    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const post = await db.getCommunityPostById(input.id);
        if (!post) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Post not found' });
        }
        
        // Increment view count
        await db.incrementPostViewCount(input.id);
        
        const author = await db.getMemberProfileById(post.authorId);
        const space = await db.getCommunitySpaceById(post.spaceId);
        const comments = await db.getPostComments(post.id);
        
        // Enrich comments with author data
        const enrichedComments = await Promise.all(comments.map(async (comment) => {
          const commentAuthor = await db.getMemberProfileById(comment.authorId);
          return { ...comment, author: commentAuthor };
        }));
        
        return { ...post, author, space, comments: enrichedComments };
      }),
    
    // Create post (requires profile)
    create: protectedProcedure
      .input(z.object({
        spaceId: z.number(),
        title: z.string().max(300).optional(),
        content: z.string().min(1),
        isAnonymous: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getMemberProfileByUserId(ctx.user.id);
        if (!profile) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Create a profile first' });
        }
        
        await db.createCommunityPost({
          spaceId: input.spaceId,
          authorId: profile.id,
          title: input.title || '',
          content: input.content,
        });
        
        return { success: true };
      }),
    
    // Update post
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().max(300).optional(),
        content: z.string().min(1).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getMemberProfileByUserId(ctx.user.id);
        if (!profile) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Create a profile first' });
        }
        
        const post = await db.getCommunityPostById(input.id);
        if (!post) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Post not found' });
        }
        
        // Only author or admin can edit
        if (post.authorId !== profile.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized to edit this post' });
        }
        
        await db.updateCommunityPost(input.id, {
          title: input.title,
          content: input.content,
        });
        
        return { success: true };
      }),
    
    // Delete post
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getMemberProfileByUserId(ctx.user.id);
        if (!profile) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Create a profile first' });
        }
        
        const post = await db.getCommunityPostById(input.id);
        if (!post) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Post not found' });
        }
        
        // Only author or admin can delete
        if (post.authorId !== profile.id && ctx.user.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized to delete this post' });
        }
        
        await db.deleteCommunityPost(input.id);
        
        return { success: true };
      }),
    
    // Like/unlike post
    toggleLike: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getMemberProfileByUserId(ctx.user.id);
        if (!profile) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Create a profile first' });
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

  // Comments procedures
  comments: router({
    // Get comments by post
    byPost: publicProcedure
      .input(z.object({ postId: z.number() }))
      .query(async ({ input }) => {
        const comments = await db.getPostComments(input.postId);
        
        // Enrich with author data
        const enrichedComments = await Promise.all(comments.map(async (comment) => {
          const author = await db.getMemberProfileById(comment.authorId);
          return { ...comment, author };
        }));
        
        return enrichedComments;
      }),
    
    // Create comment
    create: protectedProcedure
      .input(z.object({
        postId: z.number(),
        content: z.string().min(1),
        parentId: z.number().optional(),
        isAnonymous: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getMemberProfileByUserId(ctx.user.id);
        if (!profile) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Create a profile first' });
        }
        
        await db.createPostComment({
          postId: input.postId,
          authorId: profile.id,
          content: input.content,
        });
        
        return { success: true };
      }),
    
    // Like/unlike comment
    toggleLike: protectedProcedure
      .input(z.object({ commentId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const profile = await db.getMemberProfileByUserId(ctx.user.id);
        if (!profile) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Create a profile first' });
        }
        
        const hasLiked = await db.hasUserLikedComment(profile.id, input.commentId);
        
        if (hasLiked) {
          await db.removePostLike(profile.id, undefined, input.commentId);
          return { liked: false };
        } else {
          await db.addPostLike({ profileId: profile.id, commentId: input.commentId });
          return { liked: true };
        }
      }),
  }),

  // Admin procedures
  admin: router({
    users: adminProcedure.query(async () => {
      return db.getAllUsers();
    }),
    
    updateUserRole: adminProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(['user', 'admin']),
      }))
      .mutation(async ({ input }) => {
        await db.updateUserRole(input.userId, input.role);
        return { success: true };
      }),
    
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
          amount: 0,
        });
        
        return { success: true };
      }),
    
    // Seed community data
    seedCommunity: adminProcedure.mutation(async () => {
      // Create default spaces
      const defaultSpaces = [
        { name: "Introductions", slug: "introductions", description: "Welcome! Share your story and why you're here.", color: "#10B981", icon: "hand-wave", sortOrder: 1 },
        { name: "Microdosing Journey", slug: "microdosing", description: "Share your microdosing experiences and protocols.", color: "#8B5CF6", icon: "sparkles", sortOrder: 2 },
        { name: "Amanita Experiences", slug: "amanita", description: "Discuss Amanita Muscaria experiences and preparation.", color: "#EF4444", icon: "flame", sortOrder: 3 },
        { name: "Psilocybin Stories", slug: "psilocybin", description: "Share psilocybin journeys and insights.", color: "#3B82F6", icon: "moon", sortOrder: 4 },
        { name: "Recovery & Healing", slug: "recovery", description: "Support for addiction recovery and trauma healing.", color: "#F59E0B", icon: "heart", sortOrder: 5 },
        { name: "Integration", slug: "integration", description: "How to integrate psychedelic experiences into daily life.", color: "#06B6D4", icon: "sun", sortOrder: 6 },
        { name: "Questions & Answers", slug: "questions", description: "Ask questions and get answers from the community.", color: "#EC4899", icon: "help-circle", sortOrder: 7 },
      ];
      
      for (const space of defaultSpaces) {
        try {
          await db.createCommunitySpace(space);
        } catch (e) {
          // Space might already exist
        }
      }
      
      return { success: true, spacesCreated: defaultSpaces.length };
    }),
  }),

  // Member-only content
  members: router({
    vendors: memberProcedure.query(async () => {
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
