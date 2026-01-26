import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  ArrowLeft,
  Lock,
  CheckCircle,
  Shield,
  Loader2,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

declare global {
  interface Window {
    Airwallex: any;
  }
}

export default function Checkout() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'details' | 'payment' | 'success'>('details');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [cardElement, setCardElement] = useState<any>(null);

  // Load Airwallex script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.airwallex.com/assets/elements.bundle.min.js';
    script.async = true;
    script.onload = () => {
      console.log('Airwallex loaded');
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Initialize card element when we have client secret
  useEffect(() => {
    if (clientSecret && window.Airwallex && paymentStep === 'payment') {
      const initAirwallex = async () => {
        try {
          await window.Airwallex.init({
            env: 'prod', // Change to 'demo' for sandbox
            origin: window.location.origin,
          });

          const card = await window.Airwallex.createElement('card', {
            intent: {
              id: paymentIntentId,
              client_secret: clientSecret,
            },
          });

          card.mount('airwallex-card');
          setCardElement(card);
        } catch (error) {
          console.error('Airwallex init error:', error);
          toast.error('Failed to load payment form');
        }
      };

      initAirwallex();
    }
  }, [clientSecret, paymentStep, paymentIntentId]);

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setIsLoading(true);

    try {
      // Create payment intent
      const response = await fetch('/.netlify/functions/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize payment');
      }

      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
      setPaymentStep('payment');
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!cardElement) {
      toast.error('Payment form not ready');
      return;
    }

    setIsLoading(true);

    try {
      const response = await window.Airwallex.confirmPaymentIntent({
        element: cardElement,
        id: paymentIntentId,
        client_secret: clientSecret,
      });

      if (response.status === 'SUCCEEDED') {
        // Confirm with our backend
        const confirmResponse = await fetch('/.netlify/functions/confirm-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIntentId,
            email,
            name,
          }),
        });

        const confirmData = await confirmResponse.json();

        if (confirmResponse.ok) {
          setPaymentStep('success');
          toast.success('Payment successful!');
        } else {
          throw new Error(confirmData.error || 'Failed to confirm payment');
        }
      } else {
        throw new Error('Payment was not successful');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-body">Back to Home</span>
          </Link>
          <Link href="/" className="font-headline text-xl tracking-wider text-primary">
            THE PSYCHEDELIC SPEAKEASY
          </Link>
          <div className="w-24" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg mx-auto"
        >
          {/* Success State */}
          {paymentStep === 'success' ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h1 className="text-3xl font-headline mb-4">Welcome to the Speakeasy!</h1>
              <p className="text-muted-foreground mb-6">
                Your payment was successful. Check your email ({email}) for instructions to set your password and access your membership.
              </p>
              <Link href="/login">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-headline">
                  GO TO LOGIN
                </Button>
              </Link>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
              {/* Order Summary */}
              <div className="mb-8 pb-6 border-b border-border">
                <h2 className="text-sm font-typewriter text-muted-foreground mb-4">ORDER SUMMARY</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-headline text-lg">Annual Membership</h3>
                    <p className="text-sm text-muted-foreground">Full access for 1 year</p>
                  </div>
                  <div className="text-2xl font-headline text-primary">$97</div>
                </div>
              </div>

              {/* Step 1: Details */}
              {paymentStep === 'details' && (
                <>
                  <div className="text-center mb-6">
                    <Lock className="w-10 h-10 text-primary mx-auto mb-3" />
                    <h1 className="text-2xl font-headline mb-2">Complete Your Purchase</h1>
                    <p className="text-muted-foreground text-sm">
                      Enter your details to continue to payment
                    </p>
                  </div>

                  <form onSubmit={handleDetailsSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name (optional)</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        This will be your login email
                      </p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-headline py-6"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          CONTINUE TO PAYMENT
                        </>
                      )}
                    </Button>
                  </form>
                </>
              )}

              {/* Step 2: Payment */}
              {paymentStep === 'payment' && (
                <>
                  <div className="text-center mb-6">
                    <CreditCard className="w-10 h-10 text-primary mx-auto mb-3" />
                    <h1 className="text-2xl font-headline mb-2">Payment Details</h1>
                    <p className="text-muted-foreground text-sm">
                      Secure payment powered by Airwallex
                    </p>
                  </div>

                  <div className="mb-6">
                    <Label className="mb-2 block">Card Details</Label>
                    <div
                      id="airwallex-card"
                      className="p-4 border border-border rounded-lg bg-background min-h-[100px]"
                    />
                  </div>

                  <Button
                    onClick={handlePayment}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-headline py-6"
                    disabled={isLoading || !cardElement}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        PAY $97 NOW
                      </>
                    )}
                  </Button>

                  <button
                    onClick={() => setPaymentStep('details')}
                    className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground"
                  >
                    ← Back to details
                  </button>
                </>
              )}

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>256-bit Encryption</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* What you get */}
          {paymentStep !== 'success' && (
            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground mb-4">What's included:</p>
              <div className="flex flex-wrap justify-center gap-3 text-xs">
                {[
                  "Vetted Vendor Directory",
                  "Community Access",
                  "Dosing Guides",
                  "Integration Resources",
                ].map((item) => (
                  <span key={item} className="flex items-center gap-1 text-muted-foreground">
                    <CheckCircle className="w-3 h-3 text-primary" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
