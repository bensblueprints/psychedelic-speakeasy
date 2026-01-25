import { serial, pgTable, pgEnum, text, timestamp, varchar, boolean, integer } from "drizzle-orm/pg-core";

// Define enums for PostgreSQL
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const membershipStatusEnum = pgEnum("membership_status", ["active", "expired", "cancelled"]);
export const subscriberStatusEnum = pgEnum("subscriber_status", ["pending", "subscribed", "unsubscribed"]);
export const journeyStageEnum = pgEnum("journey_stage", ["researching", "preparing", "started", "experienced", "guide"]);
export const verificationStatusEnum = pgEnum("verification_status", ["pending", "verified", "featured", "suspended"]);
export const resourceTypeEnum = pgEnum("resource_type", ["book", "guide", "video", "podcast", "website", "course", "tool", "other"]);

/**
 * Core user table backing auth flow.
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  password: varchar("password", { length: 255 }), // bcrypt hashed password
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Membership table - tracks paid memberships
 */
export const memberships = pgTable("memberships", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  status: membershipStatusEnum("status").default("active").notNull(),
  startDate: timestamp("startDate").defaultNow().notNull(),
  endDate: timestamp("endDate").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  amount: integer("amount").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Membership = typeof memberships.$inferSelect;
export type InsertMembership = typeof memberships.$inferInsert;

/**
 * Blog posts table - for SEO content
 */
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 500 }).notNull(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  metaTitle: varchar("metaTitle", { length: 255 }),
  metaDescription: varchar("metaDescription", { length: 500 }),
  featuredImage: varchar("featuredImage", { length: 500 }),
  category: varchar("category", { length: 100 }),
  tags: text("tags"),
  authorId: integer("authorId"),
  isPublished: boolean("isPublished").default(false).notNull(),
  publishedAt: timestamp("publishedAt"),
  scheduledFor: timestamp("scheduledFor"),
  viewCount: integer("viewCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

/**
 * Email subscribers - for lead capture
 */
export const emailSubscribers = pgTable("email_subscribers", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  firstName: varchar("firstName", { length: 100 }),
  status: subscriberStatusEnum("status").default("pending").notNull(),
  source: varchar("source", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type EmailSubscriber = typeof emailSubscribers.$inferSelect;
export type InsertEmailSubscriber = typeof emailSubscribers.$inferInsert;

/**
 * Member profiles - anonymous community profiles
 */
export const memberProfiles = pgTable("member_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique(),
  displayName: varchar("displayName", { length: 100 }).notNull(),
  avatarIcon: varchar("avatarIcon", { length: 50 }).default("mushroom-1").notNull(),
  avatarColor: varchar("avatarColor", { length: 20 }).default("#8B5CF6").notNull(),
  bio: text("bio"),
  journeyStage: journeyStageEnum("journeyStage").default("researching"),
  joinReasons: text("joinReasons"), // JSON array: ["ptsd", "depression", "addiction"]
  isPublic: boolean("isPublic").default(true).notNull(),
  postCount: integer("postCount").default(0).notNull(),
  commentCount: integer("commentCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type MemberProfile = typeof memberProfiles.$inferSelect;
export type InsertMemberProfile = typeof memberProfiles.$inferInsert;

/**
 * Community spaces - discussion areas
 */
export const communitySpaces = pgTable("community_spaces", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }).default("💬"),
  color: varchar("color", { length: 20 }).default("#8B5CF6"),
  sortOrder: integer("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  postCount: integer("postCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type CommunitySpace = typeof communitySpaces.$inferSelect;
export type InsertCommunitySpace = typeof communitySpaces.$inferInsert;

/**
 * Community posts - user discussions
 */
export const communityPosts = pgTable("community_posts", {
  id: serial("id").primaryKey(),
  spaceId: integer("spaceId").notNull(),
  authorId: integer("authorId").notNull(), // References memberProfiles.id
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  isAnonymous: boolean("isAnonymous").default(false),
  isPinned: boolean("isPinned").default(false),
  likeCount: integer("likeCount").default(0),
  commentCount: integer("commentCount").default(0),
  viewCount: integer("viewCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityPost = typeof communityPosts.$inferInsert;

/**
 * Post comments - replies to posts
 */
export const postComments = pgTable("post_comments", {
  id: serial("id").primaryKey(),
  postId: integer("postId").notNull(),
  authorId: integer("authorId").notNull(), // References memberProfiles.id
  content: text("content").notNull(),
  isAnonymous: boolean("isAnonymous").default(false),
  likeCount: integer("likeCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type PostComment = typeof postComments.$inferSelect;
export type InsertPostComment = typeof postComments.$inferInsert;


/**
 * Post likes - tracks likes on posts and comments
 */
export const postLikes = pgTable("post_likes", {
  id: serial("id").primaryKey(),
  profileId: integer("profileId").notNull(),
  postId: integer("postId"),
  commentId: integer("commentId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PostLike = typeof postLikes.$inferSelect;
export type InsertPostLike = typeof postLikes.$inferInsert;


/**
 * Vendor categories - for organizing vetted vendors
 */
export const vendorCategories = pgTable("vendor_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }).default("🏪"),
  sortOrder: integer("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type VendorCategory = typeof vendorCategories.$inferSelect;
export type InsertVendorCategory = typeof vendorCategories.$inferInsert;

/**
 * Vetted vendors - trusted suppliers
 */
export const vendors = pgTable("vendors", {
  id: serial("id").primaryKey(),
  categoryId: integer("categoryId").notNull(),
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
  verificationStatus: verificationStatusEnum("verificationStatus").default("pending").notNull(),
  verificationNotes: text("verificationNotes"),
  rating: integer("rating").default(0), // 0-5 stars
  reviewCount: integer("reviewCount").default(0),
  isPremiumOnly: boolean("isPremiumOnly").default(true).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: integer("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = typeof vendors.$inferInsert;

/**
 * Resource categories - for organizing trusted resources
 */
export const resourceCategories = pgTable("resource_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }).default("📚"),
  sortOrder: integer("sortOrder").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ResourceCategory = typeof resourceCategories.$inferSelect;
export type InsertResourceCategory = typeof resourceCategories.$inferInsert;

/**
 * Trusted resources - guides, books, links
 */
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  categoryId: integer("categoryId").notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  slug: varchar("slug", { length: 300 }).notNull().unique(),
  description: text("description"),
  longDescription: text("longDescription"),
  resourceType: resourceTypeEnum("resourceType").default("other").notNull(),
  url: varchar("url", { length: 500 }),
  affiliateUrl: varchar("affiliateUrl", { length: 500 }),
  author: varchar("author", { length: 200 }),
  image: varchar("image", { length: 500 }),
  isPremiumOnly: boolean("isPremiumOnly").default(false).notNull(),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  sortOrder: integer("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Resource = typeof resources.$inferSelect;
export type InsertResource = typeof resources.$inferInsert;
