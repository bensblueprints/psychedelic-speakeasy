import { motion } from "framer-motion";
import { Link, useParams } from "wouter";
import { Calendar, Eye, ArrowLeft, LogIn, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

// Placeholder articles until backend is connected
const placeholderPosts: Record<string, {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  publishedAt: Date;
  viewCount: number;
  featuredImage?: string;
}> = {
  "understanding-amanita-muscaria": {
    id: 1,
    slug: "understanding-amanita-muscaria",
    title: "Understanding Amanita Muscaria: A Beginner's Guide",
    excerpt: "An introduction to the history, science, and safe practices surrounding this ancient sacred mushroom.",
    category: "Education",
    publishedAt: new Date("2026-01-15"),
    viewCount: 1247,
    featuredImage: "/images/hero-mushroom.jpg",
    content: `
# Understanding Amanita Muscaria

Amanita Muscaria, commonly known as the fly agaric, is one of the most recognizable mushrooms in the world. With its distinctive red cap dotted with white spots, it has captured human imagination for millennia.

## Historical Use

For thousands of years, indigenous peoples across Northern Europe and Siberia have used Amanita Muscaria in spiritual and healing practices. Siberian shamans, in particular, developed sophisticated methods for preparing and consuming this mushroom safely.

## Active Compounds

Unlike psilocybin mushrooms, Amanita Muscaria contains different active compounds:

- **Muscimol**: The primary psychoactive compound, responsible for most effects
- **Ibotenic Acid**: A precursor to muscimol that converts during proper preparation

## Safety Considerations

Proper preparation is essential when working with Amanita Muscaria. The decarboxylation process—converting ibotenic acid to muscimol through heat—is crucial for both safety and effectiveness.

**Important**: Always start with very low doses and work with experienced practitioners when beginning your journey.

## Modern Research

Recent studies have begun to explore Amanita Muscaria's potential therapeutic applications, including:

- Anxiety reduction
- Sleep improvement
- Pain management
- Substance withdrawal support

*This content is for educational purposes only. Always consult with healthcare professionals before using any psychoactive substances.*
    `.trim(),
  },
  "psilocybin-research-2026": {
    id: 2,
    slug: "psilocybin-research-2026",
    title: "The Latest Psilocybin Research: What Science is Revealing",
    excerpt: "A comprehensive overview of recent clinical trials and breakthrough findings in psychedelic therapy.",
    category: "Research",
    publishedAt: new Date("2026-01-10"),
    viewCount: 892,
    featuredImage: "/images/psilocybin-golden.jpg",
    content: `
# The Latest Psilocybin Research

The scientific community's understanding of psilocybin has advanced dramatically in recent years. What was once dismissed as a dangerous drug is now recognized as a potential breakthrough therapy.

## FDA Breakthrough Therapy Designation

The FDA has granted psilocybin "Breakthrough Therapy" status for treatment-resistant depression, acknowledging its potential to provide substantial improvement over existing treatments.

## Key Research Findings

### Johns Hopkins University

Researchers at Johns Hopkins have conducted landmark studies showing:

- **67%** of participants rated their psilocybin experience among the top 5 most meaningful experiences of their lives
- Significant reductions in depression and anxiety lasting 6+ months after a single session
- Effective treatment for tobacco addiction with 80% abstinence rates at 6-month follow-up

### NYU Langone

NYU's research on cancer patients with existential distress demonstrated:

- Rapid and sustained decreases in anxiety and depression
- Improved quality of life and sense of meaning
- Effects lasting up to 4.5 years in follow-up studies

## How Psilocybin Works

Psilocybin works by temporarily disrupting the Default Mode Network (DMN)—the brain region associated with self-referential thinking and the ego. This disruption allows for:

- New neural connections to form
- Breaking of rigid thought patterns
- Increased neuroplasticity

## The Future of Psychedelic Medicine

With Phase 3 clinical trials underway, psilocybin-assisted therapy could receive FDA approval within the next few years. This would mark a paradigm shift in mental health treatment.

*This content is for educational purposes only. Psilocybin remains a controlled substance in many jurisdictions.*
    `.trim(),
  },
  "integration-practices": {
    id: 3,
    slug: "integration-practices",
    title: "Integration Practices: Making the Most of Your Journey",
    excerpt: "Essential techniques for integrating psychedelic experiences into lasting personal transformation.",
    category: "Guides",
    publishedAt: new Date("2026-01-05"),
    viewCount: 654,
    featuredImage: "/images/healing-journey.jpg",
    content: `
# Integration Practices

The psychedelic experience itself is only half the journey. Integration—the process of making sense of and applying insights from your experience—is where lasting transformation happens.

## What is Integration?

Integration is the ongoing process of:

- Processing and understanding your experience
- Applying insights to daily life
- Making sustainable changes based on revelations
- Connecting the extraordinary to the ordinary

## Key Integration Practices

### 1. Journaling

Writing about your experience helps:

- Capture insights before they fade
- Process emotions and revelations
- Track patterns over multiple experiences
- Create a record for future reflection

### 2. Meditation

A regular meditation practice supports integration by:

- Maintaining access to non-ordinary states
- Developing present-moment awareness
- Processing difficult emotions
- Cultivating the observer perspective

### 3. Nature Connection

Spending time in nature helps:

- Ground insights in physical reality
- Maintain connection to something larger
- Support nervous system regulation
- Provide space for contemplation

### 4. Community Support

Connecting with others who understand:

- Validates your experience
- Provides different perspectives
- Creates accountability
- Reduces feelings of isolation

## Timeline for Integration

Integration isn't a one-time event. Consider:

- **First 24-48 hours**: Rest, journal, avoid major decisions
- **First week**: Begin gentle integration practices
- **First month**: Implement small changes, maintain practices
- **Ongoing**: Continue practices, revisit insights periodically

## When to Seek Support

Consider working with an integration therapist or coach if you:

- Feel overwhelmed by your experience
- Struggle to make sense of what happened
- Want support implementing changes
- Experience ongoing difficult emotions

*Integration is a deeply personal process. Find what works for you and be patient with yourself.*
    `.trim(),
  },
};

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { authUser } = useAuth();
  const isAuthenticated = !!authUser;
  
  const post = slug ? placeholderPosts[slug] : null;

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
                    {post.publishedAt.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
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

              {/* Article Content */}
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
                  if (line.startsWith('- ')) {
                    return <li key={i} className="ml-4 text-muted-foreground">{line.slice(2)}</li>;
                  }
                  if (line.startsWith('*') && line.endsWith('*')) {
                    return <p key={i} className="italic text-muted-foreground mt-4">{line.slice(1, -1)}</p>;
                  }
                  if (line.trim() === '') {
                    return <br key={i} />;
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
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/blog" className="flex-1">
                  <div className="p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
                    <span className="text-xs font-typewriter text-primary">MORE ARTICLES</span>
                    <p className="text-sm text-foreground mt-1">Browse all articles →</p>
                  </div>
                </Link>
                <Link href="/" className="flex-1">
                  <div className="p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
                    <span className="text-xs font-typewriter text-primary">HOME</span>
                    <p className="text-sm text-foreground mt-1">Read the full story →</p>
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
