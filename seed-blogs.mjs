// Blog post seeding script
// Run with: node seed-blogs.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the generated blog posts
const blogData = JSON.parse(fs.readFileSync('/home/ubuntu/generate_blog_posts.json', 'utf-8'));

// Generate SQL insert statements
const insertStatements = blogData.results.map((result, index) => {
  const post = result.output;
  const publishDate = new Date();
  publishDate.setDate(publishDate.getDate() + index); // Stagger publish dates
  
  // Escape single quotes for SQL
  const escape = (str) => str ? str.replace(/'/g, "''") : '';
  
  return `INSERT INTO blog_posts (title, slug, excerpt, content, category, metaTitle, metaDescription, isPublished, publishedAt, createdAt, updatedAt) VALUES (
    '${escape(post.title)}',
    '${escape(post.slug)}',
    '${escape(post.excerpt)}',
    '${escape(post.content)}',
    '${escape(post.category)}',
    '${escape(post.meta_title)}',
    '${escape(post.meta_description)}',
    1,
    '${publishDate.toISOString().slice(0, 19).replace('T', ' ')}',
    NOW(),
    NOW()
  );`;
});

// Write to SQL file
const sqlContent = insertStatements.join('\n\n');
fs.writeFileSync(path.join(__dirname, 'seed-blogs.sql'), sqlContent);

console.log(`Generated ${insertStatements.length} blog post insert statements`);
console.log('SQL file saved to: seed-blogs.sql');

// Also output JSON for direct API use
const blogPosts = blogData.results.map((result, index) => {
  const post = result.output;
  const publishDate = new Date();
  publishDate.setDate(publishDate.getDate() + index);
  
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    category: post.category,
    metaTitle: post.meta_title,
    metaDescription: post.meta_description,
    isPublished: true,
    publishedAt: publishDate.toISOString()
  };
});

fs.writeFileSync(path.join(__dirname, 'blog-posts-data.json'), JSON.stringify(blogPosts, null, 2));
console.log('JSON data saved to: blog-posts-data.json');
