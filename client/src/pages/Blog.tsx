import { motion } from "framer-motion";
import { Link } from "wouter";
import { Calendar, Eye, ArrowRight, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getLoginUrl } from "@/const";
import { getPublishedBlogPosts } from "@/lib/blogData";

export default function Blog() {
  const { authUser } = useAuth();
  const isAuthenticated = !!authUser;

  // Get published blog posts from the actual data
  const posts = getPublishedBlogPosts();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b-4 border-primary py-4">
        <div className="container">
          <div className="flex items-center justify-between">
            <Link href="/">
              <span className="text-xs font-typewriter text-muted-foreground uppercase tracking-widest hover:text-primary cursor-pointer">
                ← Back to Home
              </span>
            </Link>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className="font-typewriter text-xs">
                    MEMBER AREA
                  </Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button variant="outline" size="sm" className="font-typewriter text-xs">
                    <LogIn className="w-3 h-3 mr-2" />
                    LOGIN
                  </Button>
                </a>
              )}
            </div>
          </div>
          <div className="text-center py-6 border-y border-border my-4">
            <Link href="/">
              <h1 className="text-3xl md:text-5xl font-headline tracking-tight text-foreground hover:text-primary transition-colors cursor-pointer">
                THE PSYCHEDELIC SPEAKEASY
              </h1>
            </Link>
            <p className="font-typewriter text-sm text-muted-foreground mt-2 tracking-widest">
              ARTICLES & RESEARCH
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 md:py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl md:text-3xl font-headline mb-8">
                Latest Articles ({posts.length})
              </h2>

              <div className="space-y-6">
                {posts.map((post, index) => (
                  <motion.article
                    key={post.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors"
                  >
                    <Link href={`/blog/${post.slug}`}>
                      <div className="p-6 cursor-pointer">
                        <span className="inline-block bg-primary/20 text-primary px-3 py-1 text-xs font-typewriter mb-3">
                          {post.category.toUpperCase()}
                        </span>
                        <h3 className="text-xl md:text-2xl font-headline mb-3 hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground font-typewriter">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {post.publishedAt
                                ? new Date(post.publishedAt).toLocaleDateString()
                                : "Draft"}
                            </span>
                            {post.viewCount !== undefined && (
                              <span className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {post.viewCount} views
                              </span>
                            )}
                          </div>
                          <span className="flex items-center gap-1 text-primary">
                            Read More <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container">
          <div className="text-center text-xs text-muted-foreground font-typewriter">
            <p>© 2026 The Psychedelic Speakeasy. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
