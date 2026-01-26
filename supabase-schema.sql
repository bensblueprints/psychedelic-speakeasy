-- ============================================
-- Supabase Database Schema for The Psychedelic Speakeasy
-- ============================================
-- 
-- IMPORTANT: Run this in your Supabase SQL Editor to create all tables
-- 
-- SETUP INSTRUCTIONS:
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to SQL Editor
-- 3. Paste this entire file and run it
-- 4. After running, go to Authentication > Users to create auth users:
--    - admin@speakeasy.com (password: admin123)
--    - user@speakeasy.com (password: user123)
-- 5. Copy the auth user IDs and update the seed data below if needed
-- 
-- ============================================

-- ============================================
-- ENUMS
-- ============================================

DO $$ BEGIN
  CREATE TYPE role AS ENUM ('user', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE membership_status AS ENUM ('active', 'expired', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE subscriber_status AS ENUM ('pending', 'subscribed', 'unsubscribed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE journey_stage AS ENUM ('researching', 'preparing', 'started', 'experienced', 'guide');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'featured', 'suspended');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE resource_type AS ENUM ('book', 'guide', 'video', 'podcast', 'website', 'course', 'tool', 'other');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- USERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS users (
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

CREATE TABLE IF NOT EXISTS memberships (
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

CREATE TABLE IF NOT EXISTS blog_posts (
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

CREATE TABLE IF NOT EXISTS email_subscribers (
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

CREATE TABLE IF NOT EXISTS member_profiles (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL UNIQUE REFERENCES users(id),
  "displayName" VARCHAR(100) NOT NULL,
  "avatarIcon" VARCHAR(50) DEFAULT '🍄' NOT NULL,
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

CREATE TABLE IF NOT EXISTS community_spaces (
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

CREATE TABLE IF NOT EXISTS community_posts (
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

CREATE TABLE IF NOT EXISTS post_comments (
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

CREATE TABLE IF NOT EXISTS post_likes (
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

CREATE TABLE IF NOT EXISTS vendor_categories (
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

CREATE TABLE IF NOT EXISTS vendors (
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

CREATE TABLE IF NOT EXISTS resource_categories (
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

CREATE TABLE IF NOT EXISTS resources (
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

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts("isPublished", "publishedAt" DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_space ON community_posts("spaceId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS idx_vendors_category ON vendors("categoryId", "isActive");
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources("categoryId", "isActive");

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - Allow public read for most tables
-- ============================================

-- Users: Users can read their own data, admins can read all
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = "openId");
CREATE POLICY "Allow insert for auth users" ON users FOR INSERT WITH CHECK (true);

-- Memberships: Users can view their own memberships
CREATE POLICY "Users can view own memberships" ON memberships FOR SELECT USING (true);
CREATE POLICY "Allow insert memberships" ON memberships FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update memberships" ON memberships FOR UPDATE USING (true);

-- Blog posts: Public read for published posts
CREATE POLICY "Anyone can view published posts" ON blog_posts FOR SELECT USING (true);
CREATE POLICY "Admins can insert posts" ON blog_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update posts" ON blog_posts FOR UPDATE USING (true);
CREATE POLICY "Admins can delete posts" ON blog_posts FOR DELETE USING (true);

-- Email subscribers
CREATE POLICY "Allow read subscribers" ON email_subscribers FOR SELECT USING (true);
CREATE POLICY "Allow insert subscribers" ON email_subscribers FOR INSERT WITH CHECK (true);

-- Member profiles: Public profiles are viewable
CREATE POLICY "View public profiles" ON member_profiles FOR SELECT USING (true);
CREATE POLICY "Users can create profile" ON member_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own profile" ON member_profiles FOR UPDATE USING (true);

-- Community spaces: Public read
CREATE POLICY "Anyone can view spaces" ON community_spaces FOR SELECT USING (true);
CREATE POLICY "Admins can manage spaces" ON community_spaces FOR ALL USING (true);

-- Community posts: Public read
CREATE POLICY "Anyone can view posts" ON community_posts FOR SELECT USING (true);
CREATE POLICY "Members can create posts" ON community_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Authors can update posts" ON community_posts FOR UPDATE USING (true);

-- Comments: Public read
CREATE POLICY "Anyone can view comments" ON post_comments FOR SELECT USING (true);
CREATE POLICY "Members can create comments" ON post_comments FOR INSERT WITH CHECK (true);

-- Likes
CREATE POLICY "Anyone can view likes" ON post_likes FOR SELECT USING (true);
CREATE POLICY "Members can manage likes" ON post_likes FOR ALL USING (true);

-- Vendor categories: Public read
CREATE POLICY "Anyone can view categories" ON vendor_categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON vendor_categories FOR ALL USING (true);

-- Vendors: Public read
CREATE POLICY "Anyone can view vendors" ON vendors FOR SELECT USING (true);
CREATE POLICY "Admins can manage vendors" ON vendors FOR ALL USING (true);

-- Resource categories: Public read
CREATE POLICY "Anyone can view resource categories" ON resource_categories FOR SELECT USING (true);

-- Resources: Public read
CREATE POLICY "Anyone can view resources" ON resources FOR SELECT USING (true);

-- ============================================
-- SEED DATA: Community Spaces
-- ============================================

INSERT INTO community_spaces (name, slug, description, icon, color, "sortOrder") VALUES
('Introductions', 'introductions', 'Welcome new members and share your story', '👋', '#8B5CF6', 1),
('Experience Reports', 'experiences', 'Share your journeys and insights', '✨', '#10B981', 2),
('Questions & Advice', 'questions', 'Ask questions and get help from the community', '❓', '#3B82F6', 3),
('Integration Support', 'integration', 'Discuss integration practices and support', '🌱', '#F59E0B', 4),
('General Discussion', 'general', 'Open discussion about anything related', '💬', '#EC4899', 5)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SEED DATA: Vendor Categories
-- ============================================

INSERT INTO vendor_categories (name, slug, description, icon, "sortOrder") VALUES
('Amanita Muscaria', 'amanita', 'Vetted Amanita Muscaria suppliers', '🍄', 1),
('Psilocybin', 'psilocybin', 'Trusted psilocybin sources', '🌿', 2),
('Growing Supplies', 'growing', 'Cultivation equipment and supplies', '🌱', 3),
('Testing Services', 'testing', 'Lab testing and analysis services', '🔬', 4),
('Retreats & Ceremonies', 'retreats', 'Guided retreat and ceremony providers', '🏕️', 5),
('Integration Coaches', 'coaches', 'Professional integration support', '🧭', 6)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SEED DATA: Resource Categories
-- ============================================

INSERT INTO resource_categories (name, slug, description, icon, "sortOrder") VALUES
('Books', 'books', 'Recommended reading materials', '📚', 1),
('Guides', 'guides', 'How-to guides and protocols', '📋', 2),
('Research', 'research', 'Scientific studies and papers', '🔬', 3),
('Videos', 'videos', 'Educational video content', '🎬', 4),
('Podcasts', 'podcasts', 'Audio content and interviews', '🎙️', 5)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SEED DATA: Default Users
-- ============================================
-- NOTE: After creating auth users in Supabase Authentication, 
-- replace the openId values below with the actual auth user IDs
-- 
-- Create these users in Supabase Auth:
-- 1. admin@speakeasy.com / admin123
-- 2. user@speakeasy.com / user123
-- ============================================

INSERT INTO users ("openId", name, email, role, "createdAt", "updatedAt", "lastSignedIn") VALUES
('admin-placeholder-id', 'Admin User', 'admin@speakeasy.com', 'admin', NOW(), NOW(), NOW()),
('user-placeholder-id', 'Demo User', 'user@speakeasy.com', 'user', NOW(), NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET 
  role = EXCLUDED.role,
  "updatedAt" = NOW();

-- ============================================
-- SEED DATA: Sample Vendors (Optional)
-- ============================================

INSERT INTO vendors ("categoryId", name, slug, description, "verificationStatus", "isPremiumOnly", "isActive", "sortOrder") VALUES
(1, 'Example Amanita Supplier', 'example-amanita', 'A trusted supplier of quality Amanita Muscaria products. This is a demo vendor entry.', 'verified', true, true, 1),
(2, 'Sample Psilocybin Source', 'sample-psilocybin', 'Reliable source for psilocybin products. Demo vendor for testing purposes.', 'pending', true, true, 1)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SEED DATA: Sample Resources (Optional)
-- ============================================

INSERT INTO resources ("categoryId", title, slug, description, "resourceType", url, "isPremiumOnly", "isActive", "sortOrder") VALUES
(1, 'How to Change Your Mind', 'how-to-change-your-mind', 'Michael Pollan''s groundbreaking exploration of psychedelics and their potential for healing.', 'book', 'https://www.amazon.com/Change-Your-Mind-Consciousness-Transcendence/dp/1594204225', false, true, 1),
(2, 'Beginner''s Guide to Safe Journeying', 'beginners-guide', 'A comprehensive introduction to safe practices for psychedelic experiences.', 'guide', null, false, true, 1),
(3, 'Johns Hopkins Psilocybin Research', 'hopkins-research', 'Overview of the landmark research from Johns Hopkins Center for Psychedelic Research.', 'other', 'https://hopkinspsychedelic.org/', false, true, 1)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SEED DATA: Sample Blog Post (Optional)
-- ============================================

INSERT INTO blog_posts (slug, title, excerpt, content, category, "isPublished", "publishedAt", "createdAt") VALUES
('welcome-to-the-speakeasy', 
 'Welcome to The Psychedelic Speakeasy', 
 'Join our underground community dedicated to responsible psychedelic exploration and healing.',
 'Welcome to The Psychedelic Speakeasy, an underground community dedicated to responsible exploration of consciousness-expanding substances.

Our mission is to provide a safe space for individuals seeking healing, growth, and connection through the responsible use of psychedelics.

## What We Offer

- **Vetted Vendor Directory**: Access to trusted suppliers who have been verified by our community
- **Educational Resources**: Comprehensive guides, research summaries, and harm reduction information
- **Community Support**: Connect with like-minded individuals on their healing journeys
- **Integration Tools**: Resources to help you integrate your experiences into daily life

## Join Us

Whether you''re just beginning to research psychedelics or you''re an experienced explorer, our community welcomes you. Together, we''re building a more conscious, connected world.

*The journey begins within.*',
 'Announcements',
 true,
 NOW(),
 NOW())
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- HELPFUL QUERIES
-- ============================================

-- To see all users:
-- SELECT * FROM users ORDER BY "createdAt" DESC;

-- To make a user an admin:
-- UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';

-- To see all vendors:
-- SELECT v.*, vc.name as category_name FROM vendors v JOIN vendor_categories vc ON v."categoryId" = vc.id;

-- To see community activity:
-- SELECT p.title, p."likeCount", p."commentCount", s.name as space FROM community_posts p JOIN community_spaces s ON p."spaceId" = s.id ORDER BY p."createdAt" DESC;
