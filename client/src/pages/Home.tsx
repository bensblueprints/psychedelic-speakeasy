import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { 
  Shield, 
  Users, 
  Lock, 
  CheckCircle, 
  AlertTriangle,
  Play,
  ChevronDown,
  LogIn
} from "lucide-react";
import { Link } from "wouter";
import { ArrowRight, BookOpen } from "lucide-react";

/*
 * DESIGN: "The Underground Press" - Gonzo Journalism Revival
 * 
 * This is a direct-response landing page styled as an investigative news article.
 * Target audience: People dealing with trauma, addiction, depression who have been 
 * failed by conventional medicine.
 * 
 * Key elements:
 * - Newspaper masthead styling
 * - Long-form sales copy
 * - Video sales letter section
 * - Community opt-in form
 * - Vetted vendor messaging
 */

// Component to display latest articles - placeholder until backend is built
function LatestArticles() {
  // Placeholder articles for static display
  const placeholderPosts = [
    {
      id: 1,
      slug: "understanding-amanita-muscaria",
      title: "Understanding Amanita Muscaria: A Beginner's Guide",
      excerpt: "An introduction to the history, science, and safe practices surrounding this ancient sacred mushroom.",
      category: "Education",
      publishedAt: new Date("2026-01-15"),
    },
    {
      id: 2,
      slug: "psilocybin-research-2026",
      title: "The Latest Psilocybin Research: What Science is Revealing",
      excerpt: "A comprehensive overview of recent clinical trials and breakthrough findings in psychedelic therapy.",
      category: "Research",
      publishedAt: new Date("2026-01-10"),
    },
    {
      id: 3,
      slug: "integration-practices",
      title: "Integration Practices: Making the Most of Your Journey",
      excerpt: "Essential techniques for integrating psychedelic experiences into lasting personal transformation.",
      category: "Guides",
      publishedAt: new Date("2026-01-05"),
    },
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {placeholderPosts.map((post, index) => (
        <motion.article
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors group"
        >
          <Link href={`/blog/${post.slug}`}>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-typewriter text-primary uppercase">
                  {post.category}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground font-typewriter">
                  {post.publishedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <h4 className="text-lg font-headline text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h4>
              <p className="text-sm text-muted-foreground line-clamp-3 font-body">
                {post.excerpt}
              </p>
              <div className="mt-4 flex items-center text-primary text-sm font-typewriter">
                READ MORE
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </motion.article>
      ))}
    </div>
  );
}

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    setIsSubmitting(true);
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success("Application received! Check your inbox within 24 hours.");
    setEmail("");
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Newspaper Masthead Header */}
      <header className="border-b-4 border-primary py-4">
        <div className="container">
          <div className="flex items-center justify-between">
            <div className="text-xs font-typewriter text-muted-foreground uppercase tracking-widest">
              Vol. MMXXVI • No. 47
            </div>
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
                    MEMBER LOGIN
                  </Button>
                </a>
              )}
              <div className="text-xs font-typewriter text-muted-foreground uppercase tracking-widest hidden sm:block">
                January 23, 2026
              </div>
            </div>
          </div>
          <div className="text-center py-6 border-y border-border my-4">
            <h1 className="text-4xl md:text-6xl font-headline tracking-tight text-foreground">
              THE PSYCHEDELIC SPEAKEASY
            </h1>
            <p className="font-typewriter text-sm text-muted-foreground mt-2 tracking-widest">
              AN UNDERGROUND CHRONICLE OF HEALING & TRANSFORMATION
            </p>
          </div>
          <div className="flex items-center justify-center gap-8 text-xs font-typewriter text-muted-foreground">
            <span>INVESTIGATIVE REPORT</span>
            <span className="text-primary">•</span>
            <Link href="/blog" className="hover:text-primary transition-colors">ARTICLES</Link>
            <span className="text-primary">•</span>
            <span>MEMBERS ONLY</span>
          </div>
        </div>
      </header>

      {/* Hero Section - Breaking News Style */}
      <section className="relative py-12 md:py-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/hero-mushroom.jpg" 
            alt="Amanita Muscaria in forest" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
        </div>
        
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-block bg-primary text-primary-foreground px-4 py-1 font-headline text-sm mb-6">
              BREAKING: EXCLUSIVE INVESTIGATION
            </div>
            
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-headline leading-tight mb-6">
              FORGOTTEN CURE, FORBIDDEN KNOWLEDGE:
              <span className="block text-primary mt-2">
                How a Secret Community is Using Ancient Plant Medicine to Heal Trauma and Addiction
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl font-body text-muted-foreground leading-relaxed mb-8 italic">
              An investigative report on the underground movement rediscovering the profound healing power of 
              <span className="text-accent"> Amanita Muscaria</span> and 
              <span className="text-accent"> Psilocybin</span>, and how you can get safe, vetted access to these 
              life-changing compounds.
            </p>

            <div className="flex items-center gap-4 text-sm font-typewriter text-muted-foreground">
              <span>By The Underground Press</span>
              <span>|</span>
              <span>12 min read</span>
              <span>|</span>
              <span className="text-primary">MEMBERS ONLY ACCESS</span>
            </div>
          </motion.div>
        </div>
        
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ChevronDown className="w-8 h-8 text-muted-foreground" />
        </motion.div>
      </section>

      {/* The Story - Agitation Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {/* Drop Cap Opening */}
              <p className="text-lg md:text-xl leading-relaxed mb-6 first-letter:text-7xl first-letter:font-headline first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-primary">
                John was a decorated combat veteran. Three tours overseas. A Bronze Star. The kind of man 
                his community called a hero. But every night, when the lights went out, he became a prisoner 
                of his own mind. The flashbacks. The cold sweats. The feeling that he was still there, 
                trapped in a moment that would never end.
              </p>

              <p className="text-lg leading-relaxed mb-6 text-muted-foreground">
                For seven years, he did everything the VA told him to do. He swallowed the pills—first one, 
                then two, then a cocktail of five different medications that left him feeling like a zombie. 
                He sat through endless therapy sessions, talking about the same memories over and over, 
                never feeling any lighter. He tried to be strong for his family, even as he felt himself 
                slipping further away from them.
              </p>

              <p className="text-lg leading-relaxed mb-8 text-muted-foreground">
                <span className="font-bold text-foreground">"I wasn't living,"</span> John told us. 
                <span className="font-bold text-foreground">"I was just existing. Waiting to die."</span>
              </p>
            </motion.div>

            {/* Pull Quote */}
            <motion.blockquote
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="border-l-4 border-primary pl-6 my-12"
            >
              <p className="text-2xl md:text-3xl font-headline text-foreground leading-tight">
                "The medical system didn't fail me. It was never designed to heal me in the first place."
              </p>
              <cite className="block mt-4 text-muted-foreground font-typewriter text-sm">
                — Anonymous Member, The Psychedelic Speakeasy
              </cite>
            </motion.blockquote>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <p className="text-lg leading-relaxed mb-6 text-muted-foreground">
                John's story isn't unique. It's an epidemic hiding in plain sight. Millions of Americans 
                are trapped in the same cycle: trauma that won't heal, addiction that won't break, 
                depression that no pill can touch. They've been through the system. They've done 
                everything "right." And they're still suffering.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-16 bg-card/50 border-y border-border">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h3 className="text-2xl md:text-3xl font-headline mb-12 text-foreground">
              Does Any of This Sound Familiar?
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6 text-left">
              {[
                "Are you tired of feeling like a prisoner in your own mind?",
                "Have you been prescribed a cocktail of pills that only mask the symptoms, leaving you feeling numb and disconnected?",
                "Do you lie awake at night, haunted by the past, wondering if you'll ever feel normal again?",
                "Have you lost hope that you can ever break free from the chains of addiction?",
                "Do you feel like the medical system sees you as a number, not a person?",
                "Are you desperate for something—anything—that actually works?"
              ].map((question, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4 p-4 bg-background/50 border border-border rounded"
                >
                  <AlertTriangle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <p className="text-foreground font-body">{question}</p>
                </motion.div>
              ))}
            </div>

            <p className="mt-12 text-xl text-muted-foreground italic">
              If you answered yes to even one of these questions, keep reading. 
              <span className="text-primary font-bold"> What you're about to discover could change everything.</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Solution - Ancient Wisdom Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl md:text-4xl font-headline mb-8 text-center">
                What If The Answer Wasn't in a Lab...
                <span className="block text-primary mt-2">But in the Forest?</span>
              </h3>

              <p className="text-lg leading-relaxed mb-6 text-muted-foreground">
                For thousands of years, indigenous cultures around the world have known something that 
                modern medicine is only beginning to understand: certain plants and fungi have the power 
                to heal the mind in ways that synthetic chemicals simply cannot.
              </p>

              <p className="text-lg leading-relaxed mb-6 text-muted-foreground">
                These aren't "drugs" in the way Big Pharma wants you to think about them. They're 
                <span className="text-accent font-bold"> ancient tools for transformation</span>—used by 
                shamans, healers, and seekers for millennia to treat exactly the kinds of conditions 
                that modern psychiatry struggles with.
              </p>
            </motion.div>
          </div>

          {/* Two Column Feature - Amanita & Psilocybin */}
          <div className="grid md:grid-cols-2 gap-8 mt-16 max-w-5xl mx-auto">
            {/* Amanita Muscaria */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-lg border border-border"
            >
              <div className="aspect-video relative">
                <img 
                  src="/images/hero-mushroom.jpg" 
                  alt="Amanita Muscaria" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
              </div>
              <div className="p-6 bg-card">
                <div className="inline-block bg-primary/20 text-primary px-3 py-1 text-xs font-typewriter mb-4">
                  THE SHAMAN'S SECRET
                </div>
                <h4 className="text-2xl font-headline mb-4">Amanita Muscaria</h4>
                <p className="text-muted-foreground mb-4">
                  Used for centuries by Siberian shamans and indigenous peoples across Northern Europe 
                  for its remarkable healing properties. Modern research confirms what ancient wisdom 
                  has always known.
                </p>
                <ul className="space-y-2 text-sm">
                  {[
                    "Pain relief and anti-inflammatory effects",
                    "Anxiety and stress reduction",
                    "Sleep improvement and insomnia treatment",
                    "Substance withdrawal support",
                    "Depression and mood regulation"
                  ].map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span className="text-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Psilocybin */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-lg border border-border"
            >
              <div className="aspect-video relative">
                <img 
                  src="/images/psilocybin-golden.jpg" 
                  alt="Psilocybin Mushrooms" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
              </div>
              <div className="p-6 bg-card">
                <div className="inline-block bg-accent/20 text-accent-foreground px-3 py-1 text-xs font-typewriter mb-4">
                  THE MIRACLE MOLECULE
                </div>
                <h4 className="text-2xl font-headline mb-4">Psilocybin</h4>
                <p className="text-muted-foreground mb-4">
                  Backed by groundbreaking research from Johns Hopkins, NYU, and other leading 
                  institutions. FDA-designated "Breakthrough Therapy" for treatment-resistant depression.
                </p>
                <ul className="space-y-2 text-sm">
                  {[
                    "Treatment-resistant depression breakthrough",
                    "PTSD and trauma healing",
                    "Addiction treatment (alcohol, tobacco, opioids)",
                    "End-of-life anxiety relief",
                    "Lasting psychological transformation"
                  ].map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-accent" />
                      <span className="text-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 bg-card/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h3 className="text-2xl md:text-3xl font-headline text-center mb-12">
              The Old Way vs. The Natural Path
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-primary">
                    <th className="text-left p-4 font-headline text-foreground">Feature</th>
                    <th className="text-left p-4 font-headline text-muted-foreground">The Old System</th>
                    <th className="text-left p-4 font-headline text-primary">The Natural Path</th>
                  </tr>
                </thead>
                <tbody className="font-body">
                  {[
                    ["Source", "Synthetic Chemicals", "Earth-Grown, Natural Compounds"],
                    ["Approach", "Symptom Suppression", "Root Cause Healing"],
                    ["Side Effects", "Weight gain, numbness, dependency", "Profound insights, lasting change"],
                    ["Results", "Temporary relief, high relapse", "Potential for complete transformation"],
                    ["Timeline", "Daily medication for life", "Occasional sessions with lasting effects"],
                    ["Cost", "Ongoing prescriptions, co-pays", "Investment in your future self"]
                  ].map(([feature, old, natural], index) => (
                    <tr key={index} className="border-b border-border">
                      <td className="p-4 font-bold text-foreground">{feature}</td>
                      <td className="p-4 text-muted-foreground">{old}</td>
                      <td className="p-4 text-accent">{natural}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Video Sales Letter Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-block bg-primary text-primary-foreground px-4 py-1 font-headline text-sm mb-6">
              EXCLUSIVE VIDEO REPORT
            </div>
            
            <h3 className="text-3xl md:text-4xl font-headline mb-6">
              Watch: The Full Investigation
            </h3>
            
            <p className="text-lg text-muted-foreground mb-8">
              We've prepared a special investigative report that reveals the truth about psychedelic 
              healing that the mainstream media won't tell you. Click play to watch it now.
            </p>

            {/* Video Placeholder */}
            <div className="relative aspect-video bg-card border-2 border-border rounded-lg overflow-hidden group cursor-pointer">
              <img 
                src="/images/underground-community.jpg" 
                alt="Video thumbnail" 
                className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <Play className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground ml-1" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <p className="font-typewriter text-sm text-white/80">
                  Duration: 18:47 | Members Only Preview
                </p>
              </div>
            </div>

            <p className="mt-6 text-sm text-muted-foreground font-typewriter">
              * Full video access available after membership approval
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Community Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/healing-journey.jpg" 
            alt="Healing journey" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background" />
        </div>

        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-headline mb-6">
                Introducing: <span className="text-primary">The Psychedelic Speakeasy</span>
              </h3>
              <p className="text-lg text-muted-foreground">
                A private, members-only community for those ready to explore the healing power of 
                ancient plant medicine—safely, legally, and with expert guidance.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[
                {
                  icon: Shield,
                  title: "Vetted Vendors",
                  description: "We've done the hard work of finding and verifying the most reputable, highest-quality suppliers. No guesswork. No risk."
                },
                {
                  icon: Users,
                  title: "Expert Community",
                  description: "Connect with experienced practitioners, guides, and fellow seekers who understand your journey."
                },
                {
                  icon: Lock,
                  title: "Private & Secure",
                  description: "Your privacy is sacred. Our community operates with the utmost discretion and security."
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center p-6 bg-card/80 backdrop-blur border border-border rounded-lg"
                >
                  <feature.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h4 className="text-xl font-headline mb-3">{feature.title}</h4>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="bg-card/80 backdrop-blur border border-border rounded-lg p-6 md:p-8">
              <h4 className="text-xl font-headline mb-4 text-center">
                Inside the Speakeasy, You'll Get Access To:
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  "Curated list of vetted Amanita Muscaria suppliers",
                  "Trusted psilocybin vendor recommendations",
                  "Dosing guides and safety protocols",
                  "Integration support and resources",
                  "Private discussion forums",
                  "Exclusive research updates and news",
                  "Community support for your healing journey"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA / Opt-in Section */}
      <section className="py-16 md:py-24 bg-card border-y border-border">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="inline-block border-2 border-primary text-primary px-4 py-2 font-headline text-sm mb-6 transform -rotate-2">
              MEMBERSHIP APPLICATION
            </div>

            <h3 className="text-3xl md:text-4xl font-headline mb-6">
              Join <span className="text-primary">The Psychedelic Speakeasy</span>
            </h3>

            <p className="text-lg text-muted-foreground mb-4">
              Get instant access to our private community, vetted vendors, and exclusive content for just
            </p>
            
            <div className="text-5xl md:text-6xl font-headline text-primary mb-2">
              $97<span className="text-2xl text-muted-foreground">/year</span>
            </div>
            
            <p className="text-sm text-muted-foreground mb-8">
              That's less than $8/month for life-changing access
            </p>

            <div className="bg-background/50 border border-border rounded-lg p-6 md:p-8 mb-8">
              <p className="text-sm text-accent mb-6 font-typewriter">
                ✦ BONUS: Members also receive our free guide: 
                <span className="font-bold"> "The Beginner's Guide to Safe & Effective Microdosing"</span>
              </p>

              {isAuthenticated ? (
                <Link href="/join">
                  <Button 
                    className="h-14 px-12 bg-primary hover:bg-primary/90 text-primary-foreground font-headline text-lg tracking-wide w-full sm:w-auto"
                  >
                    BECOME A MEMBER - $97/YEAR
                  </Button>
                </Link>
              ) : (
                <div className="space-y-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Input
                        type="email"
                        placeholder="Enter your email to get started"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 bg-input border-border text-foreground placeholder:text-muted-foreground h-12 font-body"
                        required
                      />
                      <Button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-headline text-sm tracking-wide"
                      >
                        {isSubmitting ? "SUBMITTING..." : "GET ACCESS"}
                      </Button>
                    </div>
                  </form>
                  <p className="text-sm text-muted-foreground">
                    Or <a href={getLoginUrl()} className="text-primary hover:underline">login</a> if you already have an account
                  </p>
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-4 font-typewriter">
                🔒 Secure checkout. Cancel anytime.
              </p>
            </div>

            <p className="text-sm text-muted-foreground italic">
              "The journey of a thousand miles begins with a single step." — Lao Tzu
            </p>
          </motion.div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h3 className="text-2xl md:text-3xl font-headline text-center mb-12">
              What Our Members Are Saying
            </h3>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  quote: "After 15 years of antidepressants, I finally feel like myself again. The community here guided me through every step of my journey.",
                  author: "Sarah M.",
                  location: "Colorado",
                  condition: "Treatment-Resistant Depression"
                },
                {
                  quote: "I was skeptical at first, but the vetted vendors gave me confidence. Three months later, I'm alcohol-free for the first time in 20 years.",
                  author: "Michael R.",
                  location: "Oregon",
                  condition: "Alcohol Addiction"
                },
                {
                  quote: "The PTSD that haunted me for a decade is finally releasing its grip. I'm sleeping through the night. I'm present with my kids. I'm alive again.",
                  author: "James T.",
                  location: "Texas",
                  condition: "Combat PTSD"
                },
                {
                  quote: "Finding this community was like finding a family who actually understands. The support here is unlike anything I've experienced.",
                  author: "Lisa K.",
                  location: "California",
                  condition: "Anxiety & Trauma"
                }
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card border border-border rounded-lg p-6"
                >
                  <p className="text-foreground italic mb-4">"{testimonial.quote}"</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-headline text-sm">{testimonial.author}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                    </div>
                    <div className="text-xs text-primary font-typewriter">
                      {testimonial.condition}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <p className="text-center text-xs text-muted-foreground mt-8 font-typewriter">
              * Names and locations changed to protect member privacy. Results may vary.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Latest Articles Section */}
      <section className="py-16 md:py-24 bg-card/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-5xl mx-auto"
          >
            <div className="flex items-center justify-between mb-12">
              <div>
                <h3 className="text-2xl md:text-3xl font-headline text-foreground">
                  Latest From The Underground
                </h3>
                <p className="text-muted-foreground mt-2 font-body">
                  Investigative reports, research updates, and healing stories
                </p>
              </div>
              <Link href="/blog">
                <Button variant="outline" className="font-typewriter text-xs hidden md:flex">
                  VIEW ALL ARTICLES
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>

            <LatestArticles />

            <div className="text-center mt-8 md:hidden">
              <Link href="/blog">
                <Button variant="outline" className="font-typewriter text-xs">
                  VIEW ALL ARTICLES
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-primary/10 border-y border-primary/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h3 className="text-2xl md:text-3xl font-headline mb-6">
              Your Healing Journey Starts Here
            </h3>
            <p className="text-lg text-muted-foreground mb-8">
              Don't spend another day trapped in the cycle of suffering. Join thousands of others 
              who have found hope, healing, and transformation through the Psychedelic Speakeasy.
            </p>
            {isAuthenticated ? (
              <Link href="/join">
                <Button 
                  className="h-14 px-12 bg-primary hover:bg-primary/90 text-primary-foreground font-headline text-lg tracking-wide"
                >
                  BECOME A MEMBER - $97/YEAR
                </Button>
              </Link>
            ) : (
              <a href={getLoginUrl()}>
                <Button 
                  className="h-14 px-12 bg-primary hover:bg-primary/90 text-primary-foreground font-headline text-lg tracking-wide"
                >
                  JOIN NOW - $97/YEAR
                </Button>
              </a>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer / Disclaimer */}
      <footer className="py-12 border-t border-border">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h4 className="font-headline text-xl mb-2">THE PSYCHEDELIC SPEAKEASY</h4>
              <p className="text-sm text-muted-foreground font-typewriter">
                An Underground Chronicle of Healing & Transformation
              </p>
            </div>

            <div className="bg-card/50 border border-border rounded p-6 mb-8">
              <h5 className="font-headline text-sm mb-3 text-primary">IMPORTANT DISCLAIMER</h5>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The statements on this page have not been evaluated by the Food and Drug Administration. 
                The products and information discussed are not intended to diagnose, treat, cure, or 
                prevent any disease. This content is for educational and informational purposes only. 
                Always consult with a qualified healthcare professional before using any psychedelic 
                substance. The legal status of these substances varies by jurisdiction. It is your 
                responsibility to understand and comply with all applicable laws in your area. 
                Individual results may vary. Testimonials represent individual experiences and are 
                not guarantees of similar outcomes.
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-typewriter">
              <p>© 2026 The Psychedelic Speakeasy. All Rights Reserved.</p>
              <div className="flex gap-6">
                <span className="hover:text-foreground cursor-pointer">Privacy Policy</span>
                <span className="hover:text-foreground cursor-pointer">Terms of Service</span>
                <span className="hover:text-foreground cursor-pointer">Contact</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
