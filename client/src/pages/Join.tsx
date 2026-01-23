import { useState } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { 
  CheckCircle, 
  Shield, 
  Users, 
  Lock, 
  ArrowLeft,
  CreditCard,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

export default function Join() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { data: membershipStatus, isLoading: statusLoading } = trpc.membership.status.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  
  const createMembership = trpc.membership.create.useMutation({
    onSuccess: () => {
      toast.success("Welcome to The Psychedelic Speakeasy!");
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to process membership");
      setIsProcessing(false);
    },
  });

  // Redirect to login if not authenticated
  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <h1 className="text-3xl font-headline mb-4">Login Required</h1>
          <p className="text-muted-foreground mb-6">
            Please login or create an account to join The Psychedelic Speakeasy.
          </p>
          <a href={getLoginUrl()}>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-headline">
              LOGIN TO CONTINUE
            </Button>
          </a>
        </div>
      </div>
    );
  }

  // Already a member
  if (membershipStatus?.hasMembership) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-headline mb-4">You're Already a Member!</h1>
          <p className="text-muted-foreground mb-6">
            You already have access to The Psychedelic Speakeasy.
          </p>
          <Link href="/dashboard">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-headline">
              GO TO MEMBER AREA
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handlePayment = async () => {
    setIsProcessing(true);
    // For now, create membership directly (Stripe integration will be added later)
    // In production, this would redirect to Stripe Checkout
    createMembership.mutate({});
  };

  if (authLoading || statusLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b-4 border-primary py-4">
        <div className="container">
          <div className="flex items-center justify-between">
            <Link href="/">
              <span className="text-xs font-typewriter text-muted-foreground uppercase tracking-widest hover:text-primary cursor-pointer flex items-center gap-2">
                <ArrowLeft className="w-3 h-3" />
                Back to Home
              </span>
            </Link>
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

      {/* Main Content */}
      <main className="py-12 md:py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <div className="inline-block border-2 border-primary text-primary px-4 py-2 font-headline text-sm mb-6 transform -rotate-1">
                SECURE CHECKOUT
              </div>
              <h2 className="text-3xl md:text-4xl font-headline mb-4">
                Join The Psychedelic Speakeasy
              </h2>
              <p className="text-lg text-muted-foreground">
                Get instant access to our private community, vetted vendors, and exclusive content.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* What You Get */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card border border-border rounded-lg p-6 md:p-8"
              >
                <h3 className="text-xl font-headline mb-6">What You Get:</h3>
                
                <div className="space-y-4 mb-8">
                  {[
                    "Curated list of vetted Amanita Muscaria suppliers",
                    "Trusted psilocybin vendor recommendations",
                    "Dosing guides and safety protocols",
                    "Integration support and resources",
                    "Private discussion forums",
                    "Exclusive research updates and news",
                    "Community support for your healing journey",
                    "FREE: Beginner's Guide to Safe Microdosing"
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-foreground">{item}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
                  {[
                    { icon: Shield, label: "Vetted Vendors" },
                    { icon: Users, label: "Expert Community" },
                    { icon: Lock, label: "Private & Secure" },
                  ].map((feature, index) => (
                    <div key={index} className="text-center">
                      <feature.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                      <span className="text-xs text-muted-foreground font-typewriter">{feature.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Payment Box */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card border-2 border-primary rounded-lg p-6 md:p-8"
              >
                <div className="text-center mb-6">
                  <p className="text-sm text-muted-foreground mb-2">Annual Membership</p>
                  <div className="text-5xl font-headline text-primary mb-2">
                    $97
                  </div>
                  <p className="text-sm text-muted-foreground">
                    per year (less than $8/month)
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="bg-background/50 border border-border rounded p-4">
                    <p className="text-sm text-muted-foreground mb-1">Logged in as:</p>
                    <p className="font-medium">{user?.email || user?.name || "Member"}</p>
                  </div>
                </div>

                <Button 
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-headline text-lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      PROCESSING...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      COMPLETE PAYMENT - $97
                    </>
                  )}
                </Button>

                <div className="mt-6 text-center">
                  <p className="text-xs text-muted-foreground">
                    🔒 Secure payment processing
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    By joining, you agree to our Terms of Service and Privacy Policy
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground text-center">
                    <strong className="text-foreground">30-Day Money Back Guarantee</strong>
                    <br />
                    If you're not completely satisfied, we'll refund your membership.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 text-center"
            >
              <p className="text-xs text-muted-foreground font-typewriter mb-4">
                TRUSTED BY THOUSANDS OF MEMBERS
              </p>
              <div className="flex items-center justify-center gap-8 text-muted-foreground">
                <div className="text-center">
                  <div className="text-2xl font-headline text-foreground">2,500+</div>
                  <div className="text-xs">Active Members</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-headline text-foreground">50+</div>
                  <div className="text-xs">Vetted Vendors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-headline text-foreground">4.9/5</div>
                  <div className="text-xs">Member Rating</div>
                </div>
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
