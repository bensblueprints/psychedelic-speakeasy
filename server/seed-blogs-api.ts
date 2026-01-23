import { Router } from "express";
import * as db from "./db";
import fs from "fs";
import path from "path";

const seedRouter = Router();

// One-time seed endpoint - should be disabled after use in production
seedRouter.post("/seed-blogs", async (req, res) => {
  try {
    // Read the blog posts data
    const dataPath = path.join(process.cwd(), "blog-posts-data.json");
    
    if (!fs.existsSync(dataPath)) {
      return res.status(404).json({ error: "Blog posts data file not found" });
    }
    
    const blogPosts = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
    
    let created = 0;
    let skipped = 0;
    
    for (const post of blogPosts) {
      try {
        // Check if post already exists
        const existing = await db.getBlogPostBySlug(post.slug);
        if (existing) {
          skipped++;
          continue;
        }
        
        await db.createBlogPost({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          category: post.category,
          metaTitle: post.metaTitle,
          metaDescription: post.metaDescription,
          isPublished: true,
          publishedAt: post.publishedAt ? new Date(post.publishedAt) : new Date(),
          authorId: null, // System-generated posts
        });
        created++;
      } catch (e) {
        console.error(`Failed to create post: ${post.slug}`, e);
      }
    }
    
    return res.json({ 
      success: true, 
      created, 
      skipped,
      total: blogPosts.length 
    });
  } catch (error) {
    console.error("[Seed] Error:", error);
    return res.status(500).json({ error: "Failed to seed blog posts" });
  }
});

export default seedRouter;
