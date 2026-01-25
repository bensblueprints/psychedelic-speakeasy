import { Link } from "wouter";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";

export default function PostDetail() {
  // Community post detail page - requires membership
  // Will be implemented with Supabase
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <Lock className="w-16 h-16 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-headline mb-4">Members Only</h1>
        <p className="text-muted-foreground mb-6">
          Community posts are available to members only. Join The Psychedelic Speakeasy to access discussion forums and connect with fellow seekers.
        </p>
        <div className="space-y-4">
          <Link href="/join">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-headline w-full">
              BECOME A MEMBER - $97/YEAR
            </Button>
          </Link>
          <a href={getLoginUrl()}>
            <Button variant="outline" className="font-typewriter w-full">
              MEMBER LOGIN
            </Button>
          </a>
          <Link href="/community">
            <Button variant="ghost" className="font-typewriter text-xs w-full">
              ← Back to Community
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
