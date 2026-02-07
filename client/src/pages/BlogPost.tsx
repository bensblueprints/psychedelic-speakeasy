import { motion } from "framer-motion";
import { Link, useParams } from "wouter";
import { Calendar, Eye, ArrowLeft, LogIn, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { getBlogPostBySlug, getPublishedBlogPosts } from "@/lib/blogData";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { authUser } = useAuth();
  const isAuthenticated = !!authUser;
  
  const post = slug ? getBlogPostBySlug(slug) : undefined;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-headline mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-6">The article you're looking for doesn't exist.</p>
          <Link href="/blog">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Articles
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Get related posts (same category, excluding current)
  const relatedPosts = getPublishedBlogPosts()
    .filter(p => p.slug !== post.slug && p.category === post.category)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b-4 border-primary py-4">
        <div className="container">
          <div className="flex items-center justify-between">
            <Link href="/blog">
              <span className="text-xs font-typewriter text-muted-foreground uppercase tracking-widest hover:text-primary cursor-pointer flex items-center gap-2">
                <ArrowLeft className="w-3 h-3" />
                Back to Articles
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
          <div className="text-center py-4 border-y border-border my-4">
            <Link href="/">
              <h1 className="text-2xl md:text-4xl font-headline tracking-tight text-foreground hover:text-primary transition-colors cursor-pointer">
                THE PSYCHEDELIC SPEAKEASY
              </h1>
            </Link>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <main className="py-12 md:py-16">
        <div className="container">
          <article className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-block bg-primary/20 text-primary px-3 py-1 text-xs font-typewriter mb-4">
                {post.category.toUpperCase()}
              </span>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-headline leading-tight mb-6">
                {post.title}
              </h1>

              <div className="flex items-center justify-between flex-wrap gap-4 text-sm text-muted-foreground font-typewriter mb-8 pb-8 border-b border-border">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : "Draft"}
                  </span>
                  {post.viewCount !== undefined && (
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {post.viewCount} views
                    </span>
                  )}
                </div>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>

              {/* Article Content - Render Markdown */}
              <div className="prose prose-invert prose-lg max-w-none">
                {post.content.split('\n').map((line, i) => {
                  if (line.startsWith('# ')) {
                    return <h1 key={i} className="text-3xl font-headline mt-8 mb-4">{line.slice(2)}</h1>;
                  }
                  if (line.startsWith('## ')) {
                    return <h2 key={i} className="text-2xl font-headline mt-6 mb-3">{line.slice(3)}</h2>;
                  }
                  if (line.startsWith('### ')) {
                    return <h3 key={i} className="text-xl font-headline mt-4 mb-2">{line.slice(4)}</h3>;
                  }
                  if (line.startsWith('- **')) {
                    const match = line.match(/^- \*\*(.+?)\*\*:?\s*(.*)/);
                    if (match) {
                      return (
                        <li key={i} className="ml-4 text-muted-foreground mb-1">
                          <strong className="text-foreground">{match[1]}</strong>
                          {match[2] ? `: ${match[2]}` : ''}
                        </li>
                      );
                    }
                  }
                  if (line.startsWith('- ')) {
                    return <li key={i} className="ml-4 text-muted-foreground mb-1">{line.slice(2)}</li>;
                  }
                  if (line.startsWith('> ')) {
                    return (
                      <blockquote key={i} className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4">
                        {line.slice(2)}
                      </blockquote>
                    );
                  }
                  if (line.startsWith('**') && line.endsWith('**')) {
                    return <p key={i} className="font-bold text-foreground mt-4 mb-2">{line.slice(2, -2)}</p>;
                  }
                  if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
                    return <p key={i} className="italic text-muted-foreground mt-4">{line.slice(1, -1)}</p>;
                  }
                  if (line.startsWith('[') && line.includes('](')) {
                    // Reference link - render as text
                    return <p key={i} className="text-xs text-muted-foreground/70 mb-1">{line}</p>;
                  }
                  if (line.trim() === '') {
                    return <br key={i} />;
                  }
                  // Handle inline bold
                  const parts = line.split(/(\*\*[^*]+\*\*)/g);
                  if (parts.length > 1) {
                    return (
                      <p key={i} className="text-foreground/90 leading-relaxed mb-4">
                        {parts.map((part, j) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={j}>{part.slice(2, -2)}</strong>;
                          }
                          return <span key={j}>{part}</span>;
                        })}
                      </p>
                    );
                  }
                  return <p key={i} className="text-foreground/90 leading-relaxed mb-4">{line}</p>;
                })}
              </div>
            </motion.div>

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 p-8 bg-gradient-to-r from-primary/20 via-card to-primary/20 border-2 border-primary/50 rounded-lg text-center"
            >
              <h3 className="text-2xl font-headline mb-4">
                Ready to Transform Your Life?
              </h3>
              <p className="text-muted-foreground mb-6">
                Join The Psychedelic Speakeasy and get access to vetted vendors, dosing guides, and our private community.
              </p>
              <p className="text-2xl font-headline text-primary mb-4">
                Just $97/year
              </p>
              <Link href="/join">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-headline text-lg px-12">
                  BECOME A MEMBER NOW
                </Button>
              </Link>
            </motion.div>

            {/* Related Articles */}
            <div className="mt-12 pt-8 border-t border-border">
              <h4 className="font-headline text-lg mb-4">Continue Reading</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedPosts.length > 0 ? (
                  relatedPosts.map(related => (
                    <Link key={related.slug} href={`/blog/${related.slug}`} className="block">
                      <div className="p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
                        <span className="text-xs font-typewriter text-primary">{related.category.toUpperCase()}</span>
                        <p className="text-sm text-foreground mt-1 line-clamp-2">{related.title}</p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <>
                    <Link href="/blog" className="block">
                      <div className="p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
                        <span className="text-xs font-typewriter text-primary">MORE ARTICLES</span>
                        <p className="text-sm text-foreground mt-1">Browse all articles →</p>
                      </div>
                    </Link>
                    <Link href="/" className="block">
                      <div className="p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
                        <span className="text-xs font-typewriter text-primary">HOME</span>
                        <p className="text-sm text-foreground mt-1">Read the full story →</p>
                      </div>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </article>
        </div>
      </main>

      <footer className="py-8 border-t border-border">
        <div className="container">
          <div className="text-center text-xs text-muted-foreground font-typewriter">
            <p>© 2026 The Psychedelic Speakeasy. All Rights Reserved.</p>
            <p className="mt-2">
              Disclaimer: This content is for educational purposes only. Always consult a healthcare professional.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
