import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  Shield, 
  BookOpen, 
  Users, 
  Lock,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function Dashboard() {
  const { isAuthenticated } = useAuth();

  // Since we don't have a backend yet, redirect to login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Lock className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-headline mb-4">Member Login Required</h1>
          <p className="text-muted-foreground mb-6">
            Please log in to access the member dashboard.
          </p>
          <div className="space-y-4">
            <a href={getLoginUrl()}>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-headline w-full">
                <LogIn className="w-4 h-4 mr-2" />
                LOG IN
              </Button>
            </a>
            <Link href="/join">
              <Button variant="outline" className="font-headline w-full">
                BECOME A MEMBER - $97/YEAR
              </Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="font-typewriter text-xs w-full">
                ← Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Placeholder dashboard for authenticated users (will be implemented with Supabase)
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
          </div>
          <div className="text-center py-4 border-y border-border my-4">
            <Link href="/">
              <h1 className="text-2xl md:text-4xl font-headline tracking-tight text-foreground hover:text-primary transition-colors cursor-pointer">
                THE PSYCHEDELIC SPEAKEASY
              </h1>
            </Link>
            <p className="font-typewriter text-sm text-primary mt-2 tracking-widest">
              MEMBER AREA
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8 md:py-12">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-headline mb-4">
                Welcome, Member!
              </h2>
              <p className="text-muted-foreground">
                The member dashboard is being built. Check back soon for:
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card border border-border rounded-lg p-6 text-center"
              >
                <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-headline text-lg mb-2">Vetted Vendors</h3>
                <p className="text-sm text-muted-foreground">
                  Access our curated list of trusted Amanita and Psilocybin suppliers.
                </p>
                <div className="mt-4 inline-block bg-primary/20 text-primary px-3 py-1 text-xs font-typewriter rounded">
                  COMING SOON
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card border border-border rounded-lg p-6 text-center"
              >
                <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-headline text-lg mb-2">Resources</h3>
                <p className="text-sm text-muted-foreground">
                  Dosing guides, safety protocols, and integration resources.
                </p>
                <div className="mt-4 inline-block bg-primary/20 text-primary px-3 py-1 text-xs font-typewriter rounded">
                  COMING SOON
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card border border-border rounded-lg p-6 text-center"
              >
                <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-headline text-lg mb-2">Community</h3>
                <p className="text-sm text-muted-foreground">
                  Connect with fellow members in private discussion forums.
                </p>
                <div className="mt-4 inline-block bg-primary/20 text-primary px-3 py-1 text-xs font-typewriter rounded">
                  COMING SOON
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 p-8 bg-card border border-border rounded-lg text-center"
            >
              <p className="text-muted-foreground mb-4">
                We're actively building out the member features. In the meantime, explore our articles:
              </p>
              <Link href="/blog">
                <Button variant="outline" className="font-typewriter">
                  READ ARTICLES →
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border mt-auto">
        <div className="container">
          <div className="text-center text-xs text-muted-foreground font-typewriter">
            <p>© 2026 The Psychedelic Speakeasy. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
