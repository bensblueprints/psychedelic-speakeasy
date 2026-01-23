import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  CheckCircle, 
  AlertTriangle,
  Shield,
  Users,
  Lock,
  Loader2,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function OptIn() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const subscribe = trpc.subscriber.subscribe.useMutation({
    onSuccess: () => {
      // Also send to Klaviyo if configured
      sendToKlaviyo(email, firstName);
      setIsSubmitted(true);
      toast.success("You're in! Check your inbox for next steps.");
    },
    onError: (error) => {
      if (error.message?.includes("already subscribed")) {
        toast.info("You're already on the list! Check your inbox.");
        setIsSubmitted(true);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
      setIsSubmitting(false);
    },
  });

  const sendToKlaviyo = async (email: string, firstName: string) => {
    // This will be called when Klaviyo API key is configured
    // The actual API call happens on the server side
    try {
      const response = await fetch('/api/klaviyo/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName, source: 'optin-page' }),
      });
      // Silent fail - we already saved to our database
    } catch (e) {
      // Klaviyo integration optional
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    setIsSubmitting(true);
    subscribe.mutate({ email, source: 'optin-page' });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto p-8 text-center"
        >
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-headline mb-4">You're In!</h1>
          <p className="text-muted-foreground mb-6">
            Check your inbox for your free guide and next steps to join The Psychedelic Speakeasy.
          </p>
          <Link href="/">
            <Button variant="outline" className="font-typewriter">
              RETURN TO HOME
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section with Form Above the Fold */}
      <section className="min-h-screen flex flex-col">
        {/* Minimal Header */}
        <header className="py-4 border-b border-border">
          <div className="container">
            <Link href="/">
              <h1 className="text-lg md:text-xl font-headline tracking-tight text-center text-foreground hover:text-primary transition-colors cursor-pointer">
                THE PSYCHEDELIC SPEAKEASY
              </h1>
            </Link>
            <p className="text-xs text-muted-foreground text-center font-typewriter mt-1">
              AN UNDERGROUND CHRONICLE OF HEALING & TRANSFORMATION
            </p>
          </div>
        </header>

        {/* Main Hero - Email Collection Above the Fold */}
        <main className="flex-1 flex items-center py-8 md:py-12">
          <div className="container">
            <div className="max-w-xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-6"
              >
                <div className="inline-block bg-primary text-primary-foreground px-3 py-1 font-headline text-xs mb-4">
                  FREE GUIDE
                </div>
                
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-headline leading-tight mb-4">
                  Get Instant Access to
                  <span className="block text-primary">
                    Vetted Vendors & Healing Secrets
                  </span>
                </h2>
                
                <p className="text-sm md:text-base text-muted-foreground">
                  Download <strong className="text-foreground">"The Beginner's Guide to Safe & Effective Microdosing"</strong> and discover the natural path to healing.
                </p>
              </motion.div>

              {/* EMAIL FORM - ABOVE THE FOLD */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="bg-card border-2 border-primary rounded-lg p-5 md:p-6 mb-6"
              >
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-3">
                    <Input
                      type="text"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="h-11 bg-input border-border text-foreground placeholder:text-muted-foreground"
                    />
                    <Input
                      type="email"
                      placeholder="Your Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 bg-input border-border text-foreground placeholder:text-muted-foreground"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-headline text-base"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        SENDING...
                      </>
                    ) : (
                      <>
                        GET FREE ACCESS NOW
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>

                <p className="text-xs text-muted-foreground text-center mt-3">
                  🔒 100% secure. No spam. Unsubscribe anytime.
                </p>
              </motion.div>

              {/* Quick Value Props */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-3 gap-3 mb-6"
              >
                {[
                  { icon: Shield, title: "Vetted Vendors" },
                  { icon: Users, title: "Expert Community" },
                  { icon: Lock, title: "Private & Secure" },
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <item.icon className="w-6 h-6 text-primary mx-auto mb-1" />
                    <p className="text-xs text-muted-foreground">{item.title}</p>
                  </div>
                ))}
              </motion.div>

              {/* Pain Points - Compact */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center text-sm text-muted-foreground"
              >
                <p className="mb-2">Struggling with trauma, addiction, or depression?</p>
                <p className="text-primary font-medium">There's a natural path forward.</p>
              </motion.div>
            </div>
          </div>
        </main>
      </section>

      {/* Below the Fold - Additional Content */}
      <section className="py-12 bg-card/30 border-t border-border">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            {/* What You'll Get */}
            <h3 className="font-headline text-xl text-center mb-8">
              Inside Your Free Guide:
            </h3>
            <div className="space-y-4 mb-10">
              {[
                "The science behind why microdosing works when traditional treatments fail",
                "Safe dosing protocols used by experienced practitioners",
                "How to find quality, vetted sources for Amanita Muscaria & Psilocybin",
                "Integration practices that transform a trip into lasting healing",
                "Common mistakes that can derail your journey (and how to avoid them)",
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>

            {/* Pain Points Expanded */}
            <div className="bg-card border border-border rounded-lg p-6 mb-10">
              <h3 className="font-headline text-lg mb-4 text-center">Are You Experiencing:</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  "Trauma that won't heal despite years of therapy?",
                  "Addiction patterns you can't seem to break?",
                  "Depression that medications only mask?",
                  "Anxiety that controls your daily life?",
                  "Insomnia and sleep issues?",
                  "Feeling disconnected from yourself?",
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Second CTA */}
            <div className="bg-card border-2 border-primary rounded-lg p-6 text-center">
              <h3 className="font-headline text-lg mb-4">
                Ready to Start Your Healing Journey?
              </h3>
              <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-input border-border text-foreground placeholder:text-muted-foreground"
                  required
                />
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-headline"
                >
                  {isSubmitting ? "SENDING..." : "GET MY FREE GUIDE"}
                </Button>
              </form>
            </div>

            {/* Quote */}
            <p className="text-center text-sm text-muted-foreground italic mt-8">
              "The journey of a thousand miles begins with a single step." — Lao Tzu
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 border-t border-border">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <div className="bg-card/50 border border-border rounded p-4 mb-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>Disclaimer:</strong> The information provided is for educational purposes only. 
                Always consult with a qualified healthcare professional before using any psychedelic substance. 
                The legal status of these substances varies by jurisdiction.
              </p>
            </div>
            <div className="text-center text-xs text-muted-foreground font-typewriter">
              <p>© 2026 The Psychedelic Speakeasy. All Rights Reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
