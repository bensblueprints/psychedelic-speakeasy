import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  password: varchar("password", { length: 255 }), // bcrypt hashed password
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Membership table - tracks paid memberships
 */
export const memberships = mysqlTable("memberships", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  status: mysqlEnum("status", ["active", "expired", "cancelled"]).default("active").notNull(),
  startDate: timestamp("startDate").defaultNow().notNull(),
  endDate: timestamp("endDate").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  amount: int("amount").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Membership = typeof memberships.$inferSelect;
export type InsertMembership = typeof memberships.$inferInsert;

/**
 * Blog posts table - for SEO content
 */
export const blogPosts = mysqlTable("blog_posts", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 500 }).notNull(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  metaTitle: varchar("metaTitle", { length: 255 }),
  metaDescription: varchar("metaDescription", { length: 500 }),
  featuredImage: varchar("featuredImage", { length: 500 }),
  category: varchar("category", { length: 100 }),
  tags: text("tags"),
  authorId: int("authorId"),
  isPublished: boolean("isPublished").default(false).notNull(),
  publishedAt: timestamp("publishedAt"),
  scheduledFor: timestamp("scheduledFor"),
  viewCount: int("viewCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

/**
 * Email subscribers - for lead capture
 */
export const emailSubscribers = mysqlTable("email_subscribers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  firstName: varchar("firstName", { length: 100 }),
  status: mysqlEnum("status", ["pending", "subscribed", "unsubscribed"]).default("pending").notNull(),
  source: varchar("source", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailSubscriber = typeof emailSubscribers.$inferSelect;
export type InsertEmailSubscriber = typeof emailSubscribers.$inferInsert;

/**
 * Member profiles - anonymous community profiles
 * Note: Column names match actual database (joinedAt instead of createdAt for profile creation)
 */
export const memberProfiles = mysqlTable("member_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  displayName: varchar("displayName", { length: 100 }).notNull(),
  avatarIcon: varchar("avatarIcon", { length: 50 }).default("mushroom-1").notNull(),
  avatarColor: varchar("avatarColor", { length: 20 }).default("#8B5CF6").notNull(),
  bio: text("bio"),
  journeyStage: mysqlEnum("journeyStage", ["researching", "preparing", "started", "experienced", "guide"]).default("researching"),
  joinReasons: text("joinReasons"), // JSON array: ["ptsd", "depression", "addiction"]
  isPublic: boolean("isPublic").default(true).notNull(),
  postCount: int("postCount").default(0).notNull(),
  commentCount: int("commentCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MemberProfile = typeof memberProfiles.$inferSelect;
export type InsertMemberProfile = typeof memberProfiles.$inferInsert;

/**
 * Community spaces - discussion areas
 */
export const communitySpaces = mysqlTable("community_spaces", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }).default("💬"),
  color: varchar("color", { length: 20 }).default("#8B5CF6"),
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  postCount: int("postCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CommunitySpace = typeof communitySpaces.$inferSelect;
export type InsertCommunitySpace = typeof communitySpaces.$inferInsert;

/**
 * Community posts - user discussions
 */
export const communityPosts = mysqlTable("community_posts", {
  id: int("id").autoincrement().primaryKey(),
  spaceId: int("spaceId").notNull(),
  authorId: int("authorId").notNull(), // References memberProfiles.id
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  isAnonymous: boolean("isAnonymous").default(false),
  isPinned: boolean("isPinned").default(false),
  likeCount: int("likeCount").default(0),
  commentCount: int("commentCount").default(0),
  viewCount: int("viewCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityPost = typeof communityPosts.$inferInsert;

/**
 * Post comments - replies to posts
 */
export const postComments = mysqlTable("post_comments", {
  id: int("id").autoincrement().primaryKey(),
  postId: int("postId").notNull(),
  authorId: int("authorId").notNull(), // References memberProfiles.id
  content: text("content").notNull(),
  isAnonymous: boolean("isAnonymous").default(false),
  likeCount: int("likeCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PostComment = typeof postComments.$inferSelect;
export type InsertPostComment = typeof postComments.$inferInsert;


/**
 * Post likes - tracks likes on posts and comments
 */
export const postLikes = mysqlTable("post_likes", {
  id: int("id").autoincrement().primaryKey(),
  profileId: int("profileId").notNull(),
  postId: int("postId"),
  commentId: int("commentId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PostLike = typeof postLikes.$inferSelect;
export type InsertPostLike = typeof postLikes.$inferInsert;


/**
 * Vendor categories - for organizing vetted vendors
 */
export const vendorCategories = mysqlTable("vendor_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }).default("🏪"),
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VendorCategory = typeof vendorCategories.$inferSelect;
export type InsertVendorCategory = typeof vendorCategories.$inferInsert;

/**
 * Vetted vendors - trusted suppliers
 */
export const vendors = mysqlTable("vendors", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  description: text("description"),
  longDescription: text("longDescription"),
  logo: varchar("logo", { length: 500 }),
  website: varchar("website", { length: 500 }),
  telegram: varchar("telegram", { length: 200 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 50 }),
  discord: varchar("discord", { length: 200 }),
  instagram: varchar("instagram", { length: 200 }),
  location: varchar("location", { length: 200 }),
  specialties: text("specialties"), // JSON array of specialties
  verificationStatus: mysqlEnum("verificationStatus", ["pending", "verified", "featured", "suspended"]).default("pending").notNull(),
  verificationNotes: text("verificationNotes"),
  rating: int("rating").default(0), // 0-5 stars
  reviewCount: int("reviewCount").default(0),
  isPremiumOnly: boolean("isPremiumOnly").default(true).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = typeof vendors.$inferInsert;

/**
 * Resource categories - for organizing trusted resources
 */
export const resourceCategories = mysqlTable("resource_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }).default("📚"),
  sortOrder: int("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ResourceCategory = typeof resourceCategories.$inferSelect;
export type InsertResourceCategory = typeof resourceCategories.$inferInsert;

/**
 * Trusted resources - guides, books, links
 */
export const resources = mysqlTable("resources", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId").notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  slug: varchar("slug", { length: 300 }).notNull().unique(),
  description: text("description"),
  longDescription: text("longDescription"),
  resourceType: mysqlEnum("resourceType", ["book", "guide", "video", "podcast", "website", "course", "tool", "other"]).default("other").notNull(),
  url: varchar("url", { length: 500 }),
  affiliateUrl: varchar("affiliateUrl", { length: 500 }),
  author: varchar("author", { length: 200 }),
  image: varchar("image", { length: 500 }),
  isPremiumOnly: boolean("isPremiumOnly").default(false).notNull(),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Resource = typeof resources.$inferSelect;
export type InsertResource = typeof resources.$inferInsert;
