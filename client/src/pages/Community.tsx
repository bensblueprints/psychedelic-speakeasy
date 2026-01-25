import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  MessageCircle, 
  Users,
  Lock,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function Community() {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border py-4">
        <div className="container">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h1 className="text-2xl font-headline text-foreground hover:text-primary transition-colors">
                THE PSYCHEDELIC SPEAKEASY
              </h1>
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
                Articles
              </Link>
              <Link href="/community" className="text-sm text-primary font-medium">
                Community
              </Link>
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">Dashboard</Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button size="sm">Join Now</Button>
                </a>
              )}
            </nav>
          </div>
        </div>
      </header>
      
      <main className="container py-12">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <Lock className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-headline mb-4">
              Members-Only Community
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Connect with fellow seekers in our private discussion forums. Share experiences, 
              ask questions, and support each other on your healing journey.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  Discussion Forums
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Private spaces for discussing experiences, asking questions, and sharing insights.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    Introductions & Welcome
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Experience Reports
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    Integration & Support
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                    Questions & Advice
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Anonymous Profiles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Create an anonymous profile to protect your privacy while connecting with others.
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">🍄</div>
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">🌿</div>
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">🌙</div>
                  <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">✨</div>
                  <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center">🔮</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border-2 border-primary rounded-lg p-8 text-center"
          >
            <h3 className="text-2xl font-headline mb-4">
              Ready to Join the Conversation?
            </h3>
            <p className="text-muted-foreground mb-6">
              Become a member to access our private community forums and connect with others on their healing journey.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/join">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-headline">
                  BECOME A MEMBER - $97/YEAR
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <a href={getLoginUrl()}>
                <Button variant="outline" size="lg" className="font-typewriter">
                  MEMBER LOGIN
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
