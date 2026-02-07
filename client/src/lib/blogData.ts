import blogPostsJson from '../../../blog-posts-data.json';

export interface BlogPostData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  metaTitle?: string;
  metaDescription?: string;
  isPublished: boolean;
  publishedAt: string | null;
  scheduledFor?: string | null;
  viewCount?: number;
}

// Cast the imported JSON to our type
const allPosts: BlogPostData[] = blogPostsJson as BlogPostData[];

/**
 * Get all published blog posts, sorted by publishedAt descending.
 * Also publishes any posts whose scheduledFor date has passed.
 */
export function getPublishedBlogPosts(): BlogPostData[] {
  const now = new Date();
  
  return allPosts
    .filter(post => {
      // Include published posts
      if (post.isPublished) return true;
      
      // Auto-publish scheduled posts whose date has passed
      if (post.scheduledFor && new Date(post.scheduledFor) <= now) {
        post.isPublished = true;
        post.publishedAt = post.scheduledFor;
        return true;
      }
      
      return false;
    })
    .sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateB - dateA;
    });
}

/**
 * Get a single blog post by slug
 */
export function getBlogPostBySlug(slug: string): BlogPostData | undefined {
  return allPosts.find(post => post.slug === slug);
}

/**
 * Get all blog posts (including drafts) for admin purposes
 */
export function getAllBlogPosts(): BlogPostData[] {
  return [...allPosts].sort((a, b) => {
    const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return dateB - dateA;
  });
}

/**
 * Get scheduled posts that are due for publishing
 */
export function getScheduledPostsDue(): BlogPostData[] {
  const now = new Date();
  return allPosts.filter(
    post => !post.isPublished && post.scheduledFor && new Date(post.scheduledFor) <= now
  );
}

/**
 * Get draft posts (not published, not scheduled)
 */
export function getDraftPosts(): BlogPostData[] {
  return allPosts.filter(post => !post.isPublished && !post.scheduledFor);
}
