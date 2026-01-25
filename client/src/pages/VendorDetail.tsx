import { Link } from "wouter";
import { Lock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";

export default function VendorDetail() {
  // Vendor detail page - requires membership
  // Will be implemented with Supabase
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-headline mb-4">Vetted Vendor Details</h1>
        <p className="text-muted-foreground mb-6">
          Access to vetted vendor details is available to members only. Join The Psychedelic Speakeasy to view trusted suppliers and their contact information.
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
          <Link href="/dashboard">
            <Button variant="ghost" className="font-typewriter text-xs w-full">
              ← Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
