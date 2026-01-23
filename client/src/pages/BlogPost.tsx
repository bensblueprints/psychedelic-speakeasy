import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { Link, useParams } from "wouter";
import { Calendar, Eye, ArrowLeft, LogIn, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Streamdown } from "streamdown";
import { toast } from "sonner";
import { 
  AffiliateBannerSpores, 
  AffiliateBannerAmanita, 
  AmazonBookRecommendations 
} from "@/components/AffiliateSection";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();
  const { data: post, isLoading, error } = trpc.blog.bySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

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

  // Determine which affiliate banners to show based on post category/content
  const showAmanitaBanner = post?.category?.toLowerCase().includes('amanita') || 
    post?.title?.toLowerCase().includes('amanita') ||
    post?.content?.toLowerCase().includes('amanita');
  
  const showSporesBanner = post?.category?.toLowerCase().includes('psilocybin') || 
    post?.category?.toLowerCase().includes('cultivation') ||
    post?.title?.toLowerCase().includes('grow') ||
    post?.title?.toLowerCase().includes('psilocybin');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="container py-12">
          <div className="max-w-3xl mx-auto animate-pulse">
            <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
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
              {post.category && (
                <span className="inline-block bg-primary/20 text-primary px-3 py-1 text-xs font-typewriter mb-4">
                  {post.category.toUpperCase()}
                </span>
              )}

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-headline leading-tight mb-6">
                {post.title}
              </h1>

              <div className="flex items-center justify-between flex-wrap gap-4 text-sm text-muted-foreground font-typewriter mb-8 pb-8 border-b border-border">
                <div className="flex items-center gap-4">
                  {post.publishedAt && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(post.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {post.viewCount} views
                  </span>
                </div>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>

              {post.featuredImage && (
                <div className="mb-8 rounded-lg overflow-hidden border border-border">
                  <img 
                    src={post.featuredImage} 
                    alt={post.title}
                    className="w-full h-auto"
                  />
                </div>
              )}

              {/* Article Content with Affiliate Banners Inserted */}
              <div className="prose prose-invert prose-lg max-w-none">
                <Streamdown>{post.content}</Streamdown>
              </div>

              {/* Affiliate Banner - Show relevant one based on content */}
              {showAmanitaBanner && <AffiliateBannerAmanita />}
              {showSporesBanner && <AffiliateBannerSpores />}
              {!showAmanitaBanner && !showSporesBanner && <AffiliateBannerSpores />}

              {post.tags && (
                <div className="mt-8 pt-8 border-t border-border">
                  <span className="text-sm text-muted-foreground font-typewriter">Tags: </span>
                  {JSON.parse(post.tags).map((tag: string, i: number) => (
                    <span key={i} className="inline-block bg-card border border-border px-2 py-1 text-xs font-typewriter mr-2 mb-2">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Amazon Book Recommendations */}
            <AmazonBookRecommendations />

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
              <p className="text-muted-foreground mb-2">
                You've read the research. You've seen the testimonials. Now it's time to take action.
              </p>
              <p className="text-foreground mb-6 font-body">
                Join <span className="text-primary font-bold">The Psychedelic Speakeasy</span> and get instant access to:
              </p>
              <ul className="text-left max-w-md mx-auto mb-6 space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-primary">✓</span>
                  <span>Vetted vendor list (Amanita & Psilocybin)</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-primary">✓</span>
                  <span>Dosing guides & safety protocols</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-primary">✓</span>
                  <span>Private community of fellow seekers</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <span className="text-primary">✓</span>
                  <span>Monthly expert Q&A sessions</span>
                </li>
              </ul>
              <p className="text-2xl font-headline text-primary mb-4">
                Just $97/year
              </p>
              <p className="text-xs text-muted-foreground mb-6">
                That's less than $8/month for life-changing access
              </p>
              {isAuthenticated ? (
                <Link href="/join">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-headline text-lg px-12">
                    BECOME A MEMBER NOW
                  </Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-headline text-lg px-12">
                    JOIN THE SPEAKEASY - $97/YEAR
                  </Button>
                </a>
              )}
              <p className="text-xs text-muted-foreground mt-4">
                🔒 Secure checkout. Cancel anytime. 30-day money-back guarantee.
              </p>
            </motion.div>

            {/* Related Articles Teaser */}
            <div className="mt-12 pt-8 border-t border-border">
              <h4 className="font-headline text-lg mb-4">Continue Reading</h4>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/blog" className="flex-1">
                  <div className="p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
                    <span className="text-xs font-typewriter text-primary">MORE ARTICLES</span>
                    <p className="text-sm text-foreground mt-1">Browse all investigative reports →</p>
                  </div>
                </Link>
                <Link href="/" className="flex-1">
                  <div className="p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
                    <span className="text-xs font-typewriter text-primary">MAIN INVESTIGATION</span>
                    <p className="text-sm text-foreground mt-1">Read the full exposé →</p>
                  </div>
                </Link>
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
