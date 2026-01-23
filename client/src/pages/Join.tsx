import { useState, useEffect } from "react";
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
  Loader2,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

export default function Join() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'airwallex'>('stripe');
  const [airwallexConfigured, setAirwallexConfigured] = useState(false);
  
  const { data: membershipStatus, isLoading: statusLoading } = trpc.membership.status.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  
  // Check if Airwallex is configured
  useEffect(() => {
    fetch('/api/airwallex/status')
      .then(res => res.json())
      .then(data => setAirwallexConfigured(data.configured))
      .catch(() => setAirwallexConfigured(false));
  }, []);
  
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

  // Already a member (but not admin - admins should see the page for testing)
  if (membershipStatus?.hasMembership && !membershipStatus?.isAdmin) {
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

  const handleStripePayment = async () => {
    setIsProcessing(true);
    // For now, create membership directly (Stripe integration will be added later)
    // In production, this would redirect to Stripe Checkout
    createMembership.mutate({});
  };

  const handleAirwallexPayment = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/airwallex/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 97,
          currency: 'USD',
          userId: user?.id,
          userEmail: user?.email,
          userName: user?.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment');
      }

      // Load Airwallex SDK and redirect to hosted payment page
      const { init } = await import('@airwallex/components-sdk');
      
      const payment = await init({
        env: 'demo', // Change to 'prod' for production
        enabledElements: ['payments'],
      });

      // @ts-ignore - redirectToCheckout exists on the payment object
      payment.redirectToCheckout({
        intent_id: data.intentId,
        client_secret: data.clientSecret,
        currency: data.currency,
        country_code: 'US',
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/failed`,
      });
    } catch (error: any) {
      console.error('Airwallex payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const handlePayment = () => {
    if (paymentMethod === 'airwallex' && airwallexConfigured) {
      handleAirwallexPayment();
    } else {
      handleStripePayment();
    }
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
                Join The Underground
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Get instant access to vetted vendors, dosing guides, and a private community of fellow seekers.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* What You Get */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-card border border-border rounded-lg p-8"
              >
                <h3 className="text-xl font-headline mb-6 text-primary">
                  WHAT YOU GET
                </h3>
                <div className="space-y-4">
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
                  ].map((item, index) => (
                    <div key={index} className="text-center">
                      <item.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Payment Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-card border-2 border-primary rounded-lg p-8"
              >
                <div className="text-center mb-8">
                  <div className="text-sm text-muted-foreground mb-2 line-through">
                    Regular Price: $297/year
                  </div>
                  <div className="text-5xl font-headline text-primary mb-2">
                    $97
                  </div>
                  <div className="text-muted-foreground">
                    per year • Full Access
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    That's less than $8/month for life-changing access
                  </div>
                </div>

                {/* Payment Method Selection */}
                {airwallexConfigured && (
                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground mb-3 text-center">Select payment method:</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setPaymentMethod('stripe')}
                        className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                          paymentMethod === 'stripe' 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span className="text-sm font-medium">Card</span>
                      </button>
                      <button
                        onClick={() => setPaymentMethod('airwallex')}
                        className={`p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                          paymentMethod === 'airwallex' 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <Globe className="w-4 h-4" />
                        <span className="text-sm font-medium">Global Pay</span>
                      </button>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-headline text-lg py-6"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      PROCESSING...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      GET INSTANT ACCESS NOW
                    </>
                  )}
                </Button>

                <div className="mt-6 space-y-3 text-center text-xs text-muted-foreground">
                  <div className="flex items-center justify-center gap-2">
                    <Lock className="w-3 h-3" />
                    <span>256-bit SSL Encrypted Payment</span>
                  </div>
                  <p>
                    By joining, you agree to our Terms of Service and Privacy Policy.
                    This is a private membership community.
                  </p>
                </div>

                <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-center">
                    <span className="text-primary font-bold">100% Satisfaction Guarantee</span>
                    <br />
                    <span className="text-muted-foreground text-xs">
                      If you're not completely satisfied within 30 days, we'll refund your membership in full.
                    </span>
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-12 text-center"
            >
              <p className="text-xs text-muted-foreground mb-4">TRUSTED BY THOUSANDS OF SEEKERS</p>
              <div className="flex items-center justify-center gap-8 text-muted-foreground">
                <div className="text-center">
                  <div className="text-2xl font-headline text-primary">2,500+</div>
                  <div className="text-xs">Active Members</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-headline text-primary">50+</div>
                  <div className="text-xs">Vetted Vendors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-headline text-primary">4.9★</div>
                  <div className="text-xs">Member Rating</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border mt-auto">
        <div className="container">
          <div className="text-center text-xs text-muted-foreground font-typewriter">
            <p>© 2026 The Psychedelic Speakeasy. All Rights Reserved.</p>
            <p className="mt-2">
              This is a private membership community. All information is for educational purposes only.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
