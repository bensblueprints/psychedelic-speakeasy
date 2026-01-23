import { eq, desc, and, lte, isNotNull, sql, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  memberships, 
  InsertMembership,
  blogPosts,
  InsertBlogPost,
  emailSubscribers,
  InsertEmailSubscriber,
  memberProfiles,
  InsertMemberProfile,
  communitySpaces,
  InsertCommunitySpace,
  communityPosts,
  InsertCommunityPost,
  postComments,
  InsertPostComment,
  postLikes,
  InsertPostLike
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ MEMBERSHIP QUERIES ============

export async function createMembership(membership: InsertMembership) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(memberships).values(membership);
  return result;
}

export async function getActiveMembership(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const now = new Date();
  const result = await db
    .select()
    .from(memberships)
    .where(
      and(
        eq(memberships.userId, userId),
        eq(memberships.status, "active"),
        lte(memberships.startDate, now)
      )
    )
    .limit(1);
  
  if (result.length === 0) return null;
  
  const membership = result[0];
  if (membership.endDate < now) {
    await db
      .update(memberships)
      .set({ status: "expired" })
      .where(eq(memberships.id, membership.id));
    return null;
  }
  
  return membership;
}

export async function getMembershipsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(memberships)
    .where(eq(memberships.userId, userId))
    .orderBy(desc(memberships.createdAt));
}

// ============ BLOG QUERIES ============

export async function createBlogPost(post: InsertBlogPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(blogPosts).values(post);
  return result;
}

export async function updateBlogPost(id: number, updates: Partial<InsertBlogPost>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(blogPosts).set(updates).where(eq(blogPosts.id, id));
}

export async function getBlogPostBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.slug, slug))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function getBlogPostById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.id, id))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function getPublishedBlogPosts(limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.isPublished, true))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(limit)
    .offset(offset);
}

export async function getAllBlogPosts(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(blogPosts)
    .orderBy(desc(blogPosts.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getScheduledBlogPosts() {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  return db
    .select()
    .from(blogPosts)
    .where(
      and(
        eq(blogPosts.isPublished, false),
        isNotNull(blogPosts.scheduledFor),
        lte(blogPosts.scheduledFor, now)
      )
    );
}

export async function publishScheduledPosts() {
  const db = await getDb();
  if (!db) return 0;
  
  const scheduledPosts = await getScheduledBlogPosts();
  
  for (const post of scheduledPosts) {
    await db
      .update(blogPosts)
      .set({ 
        isPublished: true, 
        publishedAt: post.scheduledFor || new Date() 
      })
      .where(eq(blogPosts.id, post.id));
  }
  
  return scheduledPosts.length;
}

export async function incrementBlogViewCount(id: number) {
  const db = await getDb();
  if (!db) return;
  
  const post = await getBlogPostById(id);
  if (post) {
    await db
      .update(blogPosts)
      .set({ viewCount: (post.viewCount || 0) + 1 })
      .where(eq(blogPosts.id, id));
  }
}

export async function deleteBlogPost(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(blogPosts).where(eq(blogPosts.id, id));
}

// ============ EMAIL SUBSCRIBER QUERIES ============

export async function addEmailSubscriber(subscriber: InsertEmailSubscriber) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    await db.insert(emailSubscribers).values(subscriber);
    return { success: true };
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return { success: false, error: 'Email already subscribed' };
    }
    throw error;
  }
}

export async function getEmailSubscribers(status?: 'pending' | 'subscribed' | 'unsubscribed') {
  const db = await getDb();
  if (!db) return [];
  
  if (status) {
    return db
      .select()
      .from(emailSubscribers)
      .where(eq(emailSubscribers.status, status))
      .orderBy(desc(emailSubscribers.createdAt));
  }
  
  return db
    .select()
    .from(emailSubscribers)
    .orderBy(desc(emailSubscribers.createdAt));
}

// ============ USER QUERIES ============

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateUserRole(userId: number, role: 'user' | 'admin') {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

// ============ MEMBER PROFILE QUERIES ============

export async function createMemberProfile(profile: InsertMemberProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(memberProfiles).values(profile);
  return result;
}

export async function getMemberProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(memberProfiles)
    .where(eq(memberProfiles.userId, userId))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function getMemberProfileById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(memberProfiles)
    .where(eq(memberProfiles.id, id))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function updateMemberProfile(userId: number, updates: Partial<InsertMemberProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(memberProfiles).set(updates).where(eq(memberProfiles.userId, userId));
}

export async function getMemberProfileCount() {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db.select({ count: count() }).from(memberProfiles);
  return result[0]?.count || 0;
}

export async function getAllMemberProfiles(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(memberProfiles)
    .orderBy(desc(memberProfiles.joinedAt))
    .limit(limit)
    .offset(offset);
}

// ============ COMMUNITY SPACE QUERIES ============

export async function createCommunitySpace(space: InsertCommunitySpace) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(communitySpaces).values(space);
  return result;
}

export async function getCommunitySpaces() {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(communitySpaces)
    .orderBy(communitySpaces.sortOrder);
}

export async function getCommunitySpaceBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(communitySpaces)
    .where(eq(communitySpaces.slug, slug))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function getCommunitySpaceById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(communitySpaces)
    .where(eq(communitySpaces.id, id))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function updateSpacePostCount(spaceId: number, increment: number) {
  const db = await getDb();
  if (!db) return;
  
  const space = await getCommunitySpaceById(spaceId);
  if (space) {
    await db
      .update(communitySpaces)
      .set({ postCount: space.postCount + increment })
      .where(eq(communitySpaces.id, spaceId));
  }
}

// ============ COMMUNITY POST QUERIES ============

export async function createCommunityPost(post: InsertCommunityPost) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(communityPosts).values(post);
  
  // Update space post count
  await updateSpacePostCount(post.spaceId, 1);
  
  return result;
}

export async function getCommunityPostById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(communityPosts)
    .where(eq(communityPosts.id, id))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function getCommunityPostsBySpace(spaceId: number, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(communityPosts)
    .where(eq(communityPosts.spaceId, spaceId))
    .orderBy(desc(communityPosts.isPinned), desc(communityPosts.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getRecentCommunityPosts(limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(communityPosts)
    .orderBy(desc(communityPosts.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function updateCommunityPost(id: number, updates: Partial<InsertCommunityPost>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(communityPosts).set(updates).where(eq(communityPosts.id, id));
}

export async function deleteCommunityPost(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Delete associated comments and likes first
  await db.delete(postComments).where(eq(postComments.postId, id));
  await db.delete(postLikes).where(eq(postLikes.postId, id));
  
  // Delete the post
  await db.delete(communityPosts).where(eq(communityPosts.id, id));
}

export async function incrementPostViewCount(id: number) {
  const db = await getDb();
  if (!db) return;
  
  const post = await getCommunityPostById(id);
  if (post) {
    await db
      .update(communityPosts)
      .set({ viewCount: (post.viewCount || 0) + 1 })
      .where(eq(communityPosts.id, id));
  }
}

export async function updatePostCommentCount(postId: number, increment: number) {
  const db = await getDb();
  if (!db) return;
  
  const post = await getCommunityPostById(postId);
  if (post) {
    await db
      .update(communityPosts)
      .set({ commentCount: (post.commentCount || 0) + increment })
      .where(eq(communityPosts.id, postId));
  }
}

export async function updatePostLikeCount(postId: number, increment: number) {
  const db = await getDb();
  if (!db) return;
  
  const post = await getCommunityPostById(postId);
  if (post) {
    await db
      .update(communityPosts)
      .set({ likeCount: (post.likeCount || 0) + increment })
      .where(eq(communityPosts.id, postId));
  }
}

// ============ POST COMMENT QUERIES ============

export async function createPostComment(comment: InsertPostComment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(postComments).values(comment);
  
  // Update post comment count
  await updatePostCommentCount(comment.postId, 1);
  
  return result;
}

export async function getPostComments(postId: number, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(postComments)
    .where(eq(postComments.postId, postId))
    .orderBy(postComments.createdAt)
    .limit(limit)
    .offset(offset);
}

export async function getCommentById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(postComments)
    .where(eq(postComments.id, id))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function updateCommentLikeCount(commentId: number, increment: number) {
  const db = await getDb();
  if (!db) return;
  
  const comment = await getCommentById(commentId);
  if (comment) {
    await db
      .update(postComments)
      .set({ likeCount: (comment.likeCount || 0) + increment })
      .where(eq(postComments.id, commentId));
  }
}

// ============ POST LIKE QUERIES ============

export async function addPostLike(like: InsertPostLike) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    await db.insert(postLikes).values(like);
    
    if (like.postId) {
      await updatePostLikeCount(like.postId, 1);
    }
    if (like.commentId) {
      await updateCommentLikeCount(like.commentId, 1);
    }
    
    return { success: true };
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return { success: false, error: 'Already liked' };
    }
    throw error;
  }
}

export async function removePostLike(profileId: number, postId?: number, commentId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (postId) {
    await db
      .delete(postLikes)
      .where(and(eq(postLikes.profileId, profileId), eq(postLikes.postId, postId)));
    await updatePostLikeCount(postId, -1);
  }
  
  if (commentId) {
    await db
      .delete(postLikes)
      .where(and(eq(postLikes.profileId, profileId), eq(postLikes.commentId, commentId)));
    await updateCommentLikeCount(commentId, -1);
  }
}

export async function hasUserLikedPost(profileId: number, postId: number) {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db
    .select()
    .from(postLikes)
    .where(and(eq(postLikes.profileId, profileId), eq(postLikes.postId, postId)))
    .limit(1);
  
  return result.length > 0;
}

export async function hasUserLikedComment(profileId: number, commentId: number) {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db
    .select()
    .from(postLikes)
    .where(and(eq(postLikes.profileId, profileId), eq(postLikes.commentId, commentId)))
    .limit(1);
  
  return result.length > 0;
}

// ============ BULK INSERT FOR SEEDING ============

export async function bulkInsertMemberProfiles(profiles: InsertMemberProfile[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (profiles.length === 0) return;
  
  await db.insert(memberProfiles).values(profiles);
}

export async function bulkInsertCommunityPosts(posts: InsertCommunityPost[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (posts.length === 0) return;
  
  await db.insert(communityPosts).values(posts);
}

export async function bulkInsertPostComments(comments: InsertPostComment[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (comments.length === 0) return;
  
  await db.insert(postComments).values(comments);
}


// ============ VENDOR QUERIES ============

import { 
  vendorCategories, 
  InsertVendorCategory,
  vendors,
  InsertVendor,
  resourceCategories,
  InsertResourceCategory,
  resources,
  InsertResource
} from "../drizzle/schema";

export async function getVendorCategories() {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(vendorCategories)
    .where(eq(vendorCategories.isActive, true))
    .orderBy(vendorCategories.sortOrder);
}

export async function getAllVendorCategories() {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(vendorCategories)
    .orderBy(vendorCategories.sortOrder);
}

export async function getVendorCategoryById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(vendorCategories)
    .where(eq(vendorCategories.id, id))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function createVendorCategory(category: InsertVendorCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(vendorCategories).values(category);
  return result;
}

export async function updateVendorCategory(id: number, updates: Partial<InsertVendorCategory>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(vendorCategories).set(updates).where(eq(vendorCategories.id, id));
}

export async function deleteVendorCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(vendorCategories).where(eq(vendorCategories.id, id));
}

export async function getVendors(categoryId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  if (categoryId) {
    return db
      .select()
      .from(vendors)
      .where(and(eq(vendors.categoryId, categoryId), eq(vendors.isActive, true)))
      .orderBy(vendors.sortOrder);
  }
  
  return db
    .select()
    .from(vendors)
    .where(eq(vendors.isActive, true))
    .orderBy(vendors.sortOrder);
}

export async function getAllVendors() {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(vendors)
    .orderBy(vendors.sortOrder);
}

export async function getVendorById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(vendors)
    .where(eq(vendors.id, id))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function getVendorBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(vendors)
    .where(eq(vendors.slug, slug))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function createVendor(vendor: InsertVendor) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(vendors).values(vendor);
  return result;
}

export async function updateVendor(id: number, updates: Partial<InsertVendor>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(vendors).set(updates).where(eq(vendors.id, id));
}

export async function deleteVendor(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(vendors).where(eq(vendors.id, id));
}

// ============ RESOURCE QUERIES ============

export async function getResourceCategories() {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(resourceCategories)
    .where(eq(resourceCategories.isActive, true))
    .orderBy(resourceCategories.sortOrder);
}

export async function getAllResourceCategories() {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(resourceCategories)
    .orderBy(resourceCategories.sortOrder);
}

export async function getResourceCategoryById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(resourceCategories)
    .where(eq(resourceCategories.id, id))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function createResourceCategory(category: InsertResourceCategory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(resourceCategories).values(category);
  return result;
}

export async function updateResourceCategory(id: number, updates: Partial<InsertResourceCategory>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(resourceCategories).set(updates).where(eq(resourceCategories.id, id));
}

export async function deleteResourceCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(resourceCategories).where(eq(resourceCategories.id, id));
}

export async function getResources(categoryId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  if (categoryId) {
    return db
      .select()
      .from(resources)
      .where(and(eq(resources.categoryId, categoryId), eq(resources.isActive, true)))
      .orderBy(resources.sortOrder);
  }
  
  return db
    .select()
    .from(resources)
    .where(eq(resources.isActive, true))
    .orderBy(resources.sortOrder);
}

export async function getAllResources() {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(resources)
    .orderBy(resources.sortOrder);
}

export async function getResourceById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(resources)
    .where(eq(resources.id, id))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function getResourceBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(resources)
    .where(eq(resources.slug, slug))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function createResource(resource: InsertResource) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(resources).values(resource);
  return result;
}

export async function updateResource(id: number, updates: Partial<InsertResource>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(resources).set(updates).where(eq(resources.id, id));
}

export async function deleteResource(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(resources).where(eq(resources.id, id));
}

export async function getFeaturedResources() {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(resources)
    .where(and(eq(resources.isFeatured, true), eq(resources.isActive, true)))
    .orderBy(resources.sortOrder);
}

export async function getVerifiedVendors() {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(vendors)
    .where(and(
      eq(vendors.isActive, true),
      sql`${vendors.verificationStatus} IN ('verified', 'featured')`
    ))
    .orderBy(vendors.sortOrder);
}

export async function getFeaturedVendors() {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(vendors)
    .where(and(
      eq(vendors.isActive, true),
      eq(vendors.verificationStatus, 'featured')
    ))
    .orderBy(vendors.sortOrder);
}
