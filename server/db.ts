import { eq, desc, and, lte, isNotNull } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  memberships, 
  InsertMembership,
  blogPosts,
  InsertBlogPost,
  emailSubscribers,
  InsertEmailSubscriber
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
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
  
  // Check if membership is expired
  const membership = result[0];
  if (membership.endDate < now) {
    // Update status to expired
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
      .set({ viewCount: post.viewCount + 1 })
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
