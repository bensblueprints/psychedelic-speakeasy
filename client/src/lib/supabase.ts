import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Some features may not work.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Database types
export interface User {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  role: 'user' | 'admin';
  createdAt: string;
  lastSignedIn: string;
}

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
  featuredImage: string | null;
  category: string | null;
  tags: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  viewCount: number;
  createdAt: string;
}

export interface CommunitySpace {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
  postCount: number;
}

export interface CommunityPost {
  id: number;
  spaceId: number;
  authorId: number;
  title: string;
  content: string;
  isAnonymous: boolean;
  isPinned: boolean;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  createdAt: string;
}

export interface MemberProfile {
  id: number;
  userId: number;
  displayName: string;
  avatarIcon: string;
  avatarColor: string;
  bio: string | null;
  journeyStage: string;
  isPublic: boolean;
  postCount: number;
  commentCount: number;
  joinedAt: string;
}

export interface Vendor {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  description: string | null;
  longDescription: string | null;
  logo: string | null;
  website: string | null;
  verificationStatus: string;
  isActive: boolean;
}

export interface Resource {
  id: number;
  categoryId: number;
  title: string;
  slug: string;
  description: string | null;
  resourceType: string;
  url: string | null;
  isFeatured: boolean;
  isActive: boolean;
}

// Helper functions
export async function getPublishedBlogPosts(limit = 20) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('isPublished', true)
    .order('publishedAt', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as BlogPost[];
}

export async function getBlogPostBySlug(slug: string) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) throw error;
  return data as BlogPost;
}

export async function getCommunitySpaces() {
  const { data, error } = await supabase
    .from('community_spaces')
    .select('*')
    .eq('isActive', true)
    .order('sortOrder');

  if (error) throw error;
  return data as CommunitySpace[];
}

export async function getCommunityPosts(spaceId?: number, limit = 20) {
  let query = supabase
    .from('community_posts')
    .select('*')
    .order('createdAt', { ascending: false })
    .limit(limit);

  if (spaceId) {
    query = query.eq('spaceId', spaceId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as CommunityPost[];
}

export async function getVendors(categoryId?: number) {
  let query = supabase
    .from('vendors')
    .select('*')
    .eq('isActive', true)
    .order('sortOrder');

  if (categoryId) {
    query = query.eq('categoryId', categoryId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Vendor[];
}

export async function getResources(categoryId?: number) {
  let query = supabase
    .from('resources')
    .select('*')
    .eq('isActive', true)
    .order('sortOrder');

  if (categoryId) {
    query = query.eq('categoryId', categoryId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Resource[];
}
