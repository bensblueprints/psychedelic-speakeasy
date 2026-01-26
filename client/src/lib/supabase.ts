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
