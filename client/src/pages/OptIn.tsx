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
      {/* Minimal Header */}
      <header className="py-6 border-b border-border">
        <div className="container">
          <Link href="/">
            <h1 className="text-xl md:text-2xl font-headline tracking-tight text-center text-foreground hover:text-primary transition-colors cursor-pointer">
              THE PSYCHEDELIC SPEAKEASY
            </h1>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 md:py-20">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10"
            >
              <div className="inline-block bg-primary text-primary-foreground px-4 py-1 font-headline text-sm mb-6">
                FREE GUIDE
              </div>
              
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-headline leading-tight mb-6">
                Discover the Ancient Healing Secrets
                <span className="block text-primary mt-2">
                  They Don't Want You to Know
                </span>
              </h2>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                Get instant access to our exclusive guide: <strong className="text-foreground">"The Beginner's Guide to Safe & Effective Microdosing"</strong> — plus learn how to join our private community of vetted vendors and experienced practitioners.
              </p>
            </motion.div>

            {/* Key Points */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid md:grid-cols-3 gap-4 mb-10"
            >
              {[
                { icon: Shield, title: "Vetted Vendors", desc: "Access trusted suppliers" },
                { icon: Users, title: "Expert Community", desc: "Connect with practitioners" },
                { icon: Lock, title: "Private & Secure", desc: "Your privacy protected" },
              ].map((item, index) => (
                <div key={index} className="bg-card border border-border rounded-lg p-4 text-center">
                  <item.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h4 className="font-headline text-sm mb-1">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </motion.div>

            {/* Pain Points - Quick Version */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card/50 border border-border rounded-lg p-6 mb-10"
            >
              <h3 className="font-headline text-lg mb-4 text-center">Are You Struggling With:</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  "Trauma that won't heal despite years of therapy?",
                  "Addiction patterns you can't seem to break?",
                  "Depression that medications only mask?",
                  "Anxiety that controls your daily life?",
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-center mt-4 text-sm text-primary font-medium">
                There's a natural path forward. Enter your email to learn more.
              </p>
            </motion.div>

            {/* Opt-in Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-card border-2 border-primary rounded-lg p-6 md:p-8"
            >
              <h3 className="font-headline text-xl text-center mb-6">
                Get Your Free Guide Now
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="First Name (optional)"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="h-12 bg-input border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="Your Best Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-input border-border text-foreground placeholder:text-muted-foreground"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-headline text-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      SENDING...
                    </>
                  ) : (
                    <>
                      SEND ME THE FREE GUIDE
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <p className="text-xs text-muted-foreground text-center mt-4">
                🔒 Your information is 100% secure and will never be shared.
              </p>
            </motion.div>

            {/* What You'll Learn */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-10"
            >
              <h3 className="font-headline text-lg text-center mb-6">
                Inside Your Free Guide, You'll Discover:
              </h3>
              <div className="space-y-3">
                {[
                  "The science behind why microdosing works when traditional treatments fail",
                  "Safe dosing protocols used by experienced practitioners",
                  "How to find quality, vetted sources (hint: it's not where you think)",
                  "The integration practices that make the difference between a trip and transformation",
                  "Common mistakes that can derail your healing journey",
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Urgency */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-10 text-center"
            >
              <p className="text-sm text-muted-foreground italic">
                "The journey of a thousand miles begins with a single step." — Lao Tzu
              </p>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <div className="bg-card/50 border border-border rounded p-4 mb-6">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>Disclaimer:</strong> The information provided is for educational purposes only. 
                Always consult with a qualified healthcare professional before using any psychedelic substance. 
                The legal status of these substances varies by jurisdiction.
              </p>
            </div>
            <div className="text-center text-xs text-muted-foreground font-typewriter">
              <p>© 2026 The Psychedelic Speakeasy. All Rights Reserved.</p>
              <div className="flex justify-center gap-4 mt-2">
                <span className="hover:text-foreground cursor-pointer">Privacy Policy</span>
                <span>|</span>
                <span className="hover:text-foreground cursor-pointer">Terms of Service</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
