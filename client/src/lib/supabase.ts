import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types based on our schema
export type UserRole = 'user' | 'admin';
export type MembershipStatus = 'active' | 'expired' | 'cancelled';
export type JourneyStage = 'researching' | 'preparing' | 'started' | 'experienced' | 'guide';
export type VerificationStatus = 'pending' | 'verified' | 'featured' | 'suspended';

export interface User {
  id: number;
  openId: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  lastSignedIn: string;
}

export interface Membership {
  id: number;
  userId: number;
  status: MembershipStatus;
  startDate: string;
  endDate: string;
  amount: number;
  createdAt: string;
}

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  category: string | null;
  featuredImage: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  viewCount: number;
  createdAt: string;
}

export interface VendorCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Vendor {
  id: number;
  categoryId: number;
  name: string;
  slug: string;
  description: string | null;
  longDescription: string | null;
  website: string | null;
  telegram: string | null;
  email: string | null;
  location: string | null;
  specialties: string | null;
  verificationStatus: VerificationStatus;
  rating: number;
  reviewCount: number;
  isPremiumOnly: boolean;
  isActive: boolean;
  sortOrder: number;
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

export interface MemberProfile {
  id: number;
  userId: number;
  displayName: string;
  avatarIcon: string;
  avatarColor: string;
  bio: string | null;
  journeyStage: JourneyStage;
  joinReasons: string | null;
  isPublic: boolean;
  postCount: number;
  commentCount: number;
  joinedAt: string;
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
  // Joined fields
  author?: MemberProfile;
  space?: CommunitySpace;
}

export interface PostComment {
  id: number;
  postId: number;
  authorId: number;
  content: string;
  isAnonymous: boolean;
  likeCount: number;
  createdAt: string;
  // Joined fields
  author?: MemberProfile;
}

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

export async function signUp(email: string, password: string, name?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }
    }
  });

  if (error) throw error;

  // Create user record in our users table
  if (data.user) {
    const { error: insertError } = await supabase.from('users').upsert({
      openId: data.user.id,
      email: data.user.email,
      name: name || null,
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastSignedIn: new Date().toISOString()
    }, { onConflict: 'openId' });

    if (insertError) console.error('Error creating user record:', insertError);
  }

  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;

  // Update last signed in
  if (data.user) {
    await supabase.from('users')
      .update({ lastSignedIn: new Date().toISOString() })
      .eq('openId', data.user.id);
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

export async function getCurrentAuthUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function getCurrentUserProfile(): Promise<User | null> {
  const authUser = await getCurrentAuthUser();
  if (!authUser) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('openId', authUser.id)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data as User;
}

export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback);
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  });
  if (error) throw error;
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });
  if (error) throw error;
}

// ============================================
// DATA FETCHING FUNCTIONS
// ============================================

export async function getBlogPosts(limit = 20) {
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

export async function getVendorCategories() {
  const { data, error } = await supabase
    .from('vendor_categories')
    .select('*')
    .eq('isActive', true)
    .order('sortOrder');

  if (error) throw error;
  return data as VendorCategory[];
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
  return data;
}

export async function getResourceCategories() {
  const { data, error } = await supabase
    .from('resource_categories')
    .select('*')
    .eq('isActive', true)
    .order('sortOrder');

  if (error) throw error;
  return data;
}
