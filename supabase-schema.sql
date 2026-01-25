-- Supabase Database Schema for The Psychedelic Speakeasy
-- Run this in your Supabase SQL Editor to create all tables

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE role AS ENUM ('user', 'admin');
CREATE TYPE membership_status AS ENUM ('active', 'expired', 'cancelled');
CREATE TYPE subscriber_status AS ENUM ('pending', 'subscribed', 'unsubscribed');
CREATE TYPE journey_stage AS ENUM ('researching', 'preparing', 'started', 'experienced', 'guide');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'featured', 'suspended');
CREATE TYPE resource_type AS ENUM ('book', 'guide', 'video', 'podcast', 'website', 'course', 'tool', 'other');

-- ============================================
-- USERS TABLE
-- ============================================

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  "openId" VARCHAR(64) NOT NULL UNIQUE,
  name TEXT,
  email VARCHAR(320) UNIQUE,
  password VARCHAR(255),
  "loginMethod" VARCHAR(64),
  role role DEFAULT 'user' NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "lastSignedIn" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============================================
-- MEMBERSHIPS TABLE
-- ============================================

CREATE TABLE memberships (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES users(id),
  status membership_status DEFAULT 'active' NOT NULL,
  "startDate" TIMESTAMP DEFAULT NOW() NOT NULL,
  "endDate" TIMESTAMP NOT NULL,
  "stripeCustomerId" VARCHAR(255),
  "stripeSubscriptionId" VARCHAR(255),
  amount INTEGER NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============================================
-- BLOG POSTS TABLE
-- ============================================

CREATE TABLE blog_posts (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(500) NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  "metaTitle" VARCHAR(255),
  "metaDescription" VARCHAR(500),
  "featuredImage" VARCHAR(500),
  category VARCHAR(100),
  tags TEXT,
  "authorId" INTEGER REFERENCES users(id),
  "isPublished" BOOLEAN DEFAULT FALSE NOT NULL,
  "publishedAt" TIMESTAMP,
  "scheduledFor" TIMESTAMP,
  "viewCount" INTEGER DEFAULT 0 NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============================================
-- EMAIL SUBSCRIBERS TABLE
-- ============================================

CREATE TABLE email_subscribers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(320) NOT NULL UNIQUE,
  "firstName" VARCHAR(100),
  status subscriber_status DEFAULT 'pending' NOT NULL,
  source VARCHAR(100),
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============================================
-- MEMBER PROFILES TABLE (Anonymous community profiles)
-- ============================================

CREATE TABLE member_profiles (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL UNIQUE REFERENCES users(id),
  "displayName" VARCHAR(100) NOT NULL,
  "avatarIcon" VARCHAR(50) DEFAULT 'mushroom-1' NOT NULL,
  "avatarColor" VARCHAR(20) DEFAULT '#8B5CF6' NOT NULL,
  bio TEXT,
  "journeyStage" journey_stage DEFAULT 'researching',
  "joinReasons" TEXT,
  "isPublic" BOOLEAN DEFAULT TRUE NOT NULL,
  "postCount" INTEGER DEFAULT 0 NOT NULL,
  "commentCount" INTEGER DEFAULT 0 NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "joinedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============================================
-- COMMUNITY SPACES TABLE
-- ============================================

CREATE TABLE community_spaces (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50) DEFAULT '💬',
  color VARCHAR(20) DEFAULT '#8B5CF6',
  "sortOrder" INTEGER DEFAULT 0 NOT NULL,
  "isActive" BOOLEAN DEFAULT TRUE NOT NULL,
  "postCount" INTEGER DEFAULT 0 NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============================================
-- COMMUNITY POSTS TABLE
-- ============================================

CREATE TABLE community_posts (
  id SERIAL PRIMARY KEY,
  "spaceId" INTEGER NOT NULL REFERENCES community_spaces(id),
  "authorId" INTEGER NOT NULL REFERENCES member_profiles(id),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  "isAnonymous" BOOLEAN DEFAULT FALSE,
  "isPinned" BOOLEAN DEFAULT FALSE,
  "likeCount" INTEGER DEFAULT 0,
  "commentCount" INTEGER DEFAULT 0,
  "viewCount" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============================================
-- POST COMMENTS TABLE
-- ============================================

CREATE TABLE post_comments (
  id SERIAL PRIMARY KEY,
  "postId" INTEGER NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  "authorId" INTEGER NOT NULL REFERENCES member_profiles(id),
  content TEXT NOT NULL,
  "isAnonymous" BOOLEAN DEFAULT FALSE,
  "likeCount" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============================================
-- POST LIKES TABLE
-- ============================================

CREATE TABLE post_likes (
  id SERIAL PRIMARY KEY,
  "profileId" INTEGER NOT NULL REFERENCES member_profiles(id),
  "postId" INTEGER REFERENCES community_posts(id) ON DELETE CASCADE,
  "commentId" INTEGER REFERENCES post_comments(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  UNIQUE("profileId", "postId"),
  UNIQUE("profileId", "commentId")
);

-- ============================================
-- VENDOR CATEGORIES TABLE
-- ============================================

CREATE TABLE vendor_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50) DEFAULT '🏪',
  "sortOrder" INTEGER DEFAULT 0 NOT NULL,
  "isActive" BOOLEAN DEFAULT TRUE NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============================================
-- VENDORS TABLE
-- ============================================

CREATE TABLE vendors (
  id SERIAL PRIMARY KEY,
  "categoryId" INTEGER NOT NULL REFERENCES vendor_categories(id),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  description TEXT,
  "longDescription" TEXT,
  logo VARCHAR(500),
  website VARCHAR(500),
  telegram VARCHAR(200),
  email VARCHAR(320),
  phone VARCHAR(50),
  discord VARCHAR(200),
  instagram VARCHAR(200),
  location VARCHAR(200),
  specialties TEXT,
  "verificationStatus" verification_status DEFAULT 'pending' NOT NULL,
  "verificationNotes" TEXT,
  rating INTEGER DEFAULT 0,
  "reviewCount" INTEGER DEFAULT 0,
  "isPremiumOnly" BOOLEAN DEFAULT TRUE NOT NULL,
  "isActive" BOOLEAN DEFAULT TRUE NOT NULL,
  "sortOrder" INTEGER DEFAULT 0 NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============================================
-- RESOURCE CATEGORIES TABLE
-- ============================================

CREATE TABLE resource_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50) DEFAULT '📚',
  "sortOrder" INTEGER DEFAULT 0 NOT NULL,
  "isActive" BOOLEAN DEFAULT TRUE NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============================================
-- RESOURCES TABLE
-- ============================================

CREATE TABLE resources (
  id SERIAL PRIMARY KEY,
  "categoryId" INTEGER NOT NULL REFERENCES resource_categories(id),
  title VARCHAR(300) NOT NULL,
  slug VARCHAR(300) NOT NULL UNIQUE,
  description TEXT,
  "longDescription" TEXT,
  "resourceType" resource_type DEFAULT 'other' NOT NULL,
  url VARCHAR(500),
  "affiliateUrl" VARCHAR(500),
  author VARCHAR(200),
  image VARCHAR(500),
  "isPremiumOnly" BOOLEAN DEFAULT FALSE NOT NULL,
  "isFeatured" BOOLEAN DEFAULT FALSE NOT NULL,
  "isActive" BOOLEAN DEFAULT TRUE NOT NULL,
  "sortOrder" INTEGER DEFAULT 0 NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON blog_posts("isPublished", "publishedAt" DESC);
CREATE INDEX idx_community_posts_space ON community_posts("spaceId", "createdAt" DESC);
CREATE INDEX idx_vendors_category ON vendors("categoryId", "isActive");
CREATE INDEX idx_resources_category ON resources("categoryId", "isActive");

-- ============================================
-- SEED DATA: Community Spaces
-- ============================================

INSERT INTO community_spaces (name, slug, description, icon, color, "sortOrder") VALUES
('Introductions', 'introductions', 'Welcome new members and share your story', '👋', '#8B5CF6', 1),
('Experience Reports', 'experiences', 'Share your journeys and insights', '✨', '#10B981', 2),
('Questions & Advice', 'questions', 'Ask questions and get help from the community', '❓', '#3B82F6', 3),
('Integration Support', 'integration', 'Discuss integration practices and support', '🌱', '#F59E0B', 4),
('General Discussion', 'general', 'Open discussion about anything related', '💬', '#EC4899', 5);

-- ============================================
-- SEED DATA: Vendor Categories
-- ============================================

INSERT INTO vendor_categories (name, slug, description, icon, "sortOrder") VALUES
('Amanita Muscaria', 'amanita', 'Vetted Amanita Muscaria suppliers', '🍄', 1),
('Psilocybin', 'psilocybin', 'Trusted psilocybin sources', '🌿', 2),
('Growing Supplies', 'growing', 'Cultivation equipment and supplies', '🌱', 3),
('Testing Services', 'testing', 'Lab testing and analysis services', '🔬', 4);

-- ============================================
-- SEED DATA: Resource Categories
-- ============================================

INSERT INTO resource_categories (name, slug, description, icon, "sortOrder") VALUES
('Books', 'books', 'Recommended reading materials', '📚', 1),
('Guides', 'guides', 'How-to guides and protocols', '📋', 2),
('Research', 'research', 'Scientific studies and papers', '🔬', 3),
('Videos', 'videos', 'Educational video content', '🎬', 4);
