import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Calendar, Clock, Eye, ArrowRight, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function Blog() {
  const { isAuthenticated } = useAuth();
  const { data: posts, isLoading } = trpc.blog.list.useQuery({ limit: 20, offset: 0 });

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
                Latest Articles
              </h2>

              {isLoading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-card border border-border rounded-lg p-6 animate-pulse">
                      <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
                      <div className="h-4 bg-muted rounded w-full mb-2"></div>
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : posts && posts.length > 0 ? (
                <div className="space-y-6">
                  {posts.map((post, index) => (
                    <motion.article
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors"
                    >
                      <Link href={`/blog/${post.slug}`}>
                        <div className="p-6 cursor-pointer">
                          {post.category && (
                            <span className="inline-block bg-primary/20 text-primary px-3 py-1 text-xs font-typewriter mb-3">
                              {post.category.toUpperCase()}
                            </span>
                          )}
                          <h3 className="text-xl md:text-2xl font-headline mb-3 hover:text-primary transition-colors">
                            {post.title}
                          </h3>
                          {post.excerpt && (
                            <p className="text-muted-foreground mb-4 line-clamp-2">
                              {post.excerpt}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-sm text-muted-foreground font-typewriter">
                            <div className="flex items-center gap-4">
                              {post.publishedAt && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {new Date(post.publishedAt).toLocaleDateString()}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                {post.viewCount} views
                              </span>
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
              ) : (
                <div className="text-center py-12 bg-card border border-border rounded-lg">
                  <p className="text-muted-foreground mb-4">No articles published yet.</p>
                  <p className="text-sm text-muted-foreground">Check back soon for new content!</p>
                </div>
              )}
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
