import { motion } from "framer-motion";
import { Link } from "wouter";
import { 
  Lock,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function AdminDashboard() {
  const { isAuthenticated } = useAuth();

  // Admin dashboard - requires authentication and admin role
  // Will be implemented with Supabase Auth and role checks
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-headline mb-4">Admin Dashboard</h1>
        <p className="text-muted-foreground mb-6">
          The admin dashboard is being built. This area will allow you to:
        </p>
        <ul className="text-left text-sm text-muted-foreground mb-6 space-y-2">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            Manage blog posts
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            View and manage users
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            Manage vendors and resources
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            View email subscribers
          </li>
        </ul>
        
        {isAuthenticated ? (
          <Link href="/dashboard">
            <Button variant="outline" className="font-typewriter">
              ← Back to Dashboard
            </Button>
          </Link>
        ) : (
          <a href={getLoginUrl()}>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-headline">
              <Lock className="w-4 h-4 mr-2" />
              ADMIN LOGIN
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}
