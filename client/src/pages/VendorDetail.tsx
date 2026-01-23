import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { Link, useParams } from "wouter";
import { 
  Shield, 
  Globe, 
  MessageCircle, 
  Mail, 
  Phone,
  MapPin,
  CheckCircle,
  ArrowLeft,
  Loader2,
  Lock,
  ExternalLink,
  Instagram
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function VendorDetail() {
  const params = useParams<{ slug: string }>();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  const { data: membershipStatus, isLoading: statusLoading } = trpc.membership.status.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  
  const { data: vendor, isLoading: vendorLoading, error } = trpc.vendors.bySlug.useQuery(
    { slug: params.slug || '' },
    { enabled: !!params.slug && membershipStatus?.hasMembership }
  );

  // Redirect to login if not authenticated
  if (!authLoading && !isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  // Loading state
  if (authLoading || statusLoading || vendorLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not a member
  if (!membershipStatus?.hasMembership) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Lock className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-headline mb-4">Membership Required</h1>
          <p className="text-muted-foreground mb-6">
            You need an active membership to view vendor details.
          </p>
          <Link href="/join">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-headline">
              BECOME A MEMBER - $97/YEAR
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Vendor not found
  if (error || !vendor) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <h1 className="text-3xl font-headline mb-4">Vendor Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The vendor you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/dashboard">
            <Button variant="outline" className="font-typewriter">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const verificationBadge = {
    verified: { text: 'VERIFIED', color: 'text-green-500 bg-green-500/10' },
    featured: { text: 'FEATURED', color: 'text-yellow-500 bg-yellow-500/10' },
    pending: { text: 'PENDING', color: 'text-gray-500 bg-gray-500/10' },
    suspended: { text: 'SUSPENDED', color: 'text-red-500 bg-red-500/10' },
  }[vendor.verificationStatus] || { text: 'UNKNOWN', color: 'text-gray-500 bg-gray-500/10' };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b-4 border-primary py-4">
        <div className="container">
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <span className="text-xs font-typewriter text-muted-foreground uppercase tracking-widest hover:text-primary cursor-pointer">
                ← Back to Dashboard
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
              VETTED VENDOR
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8 md:py-12">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Vendor Header */}
              <div className="bg-card border border-border rounded-lg p-6 md:p-8 mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    {vendor.logo ? (
                      <img 
                        src={vendor.logo} 
                        alt={vendor.name} 
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Shield className="w-8 h-8 text-primary" />
                      </div>
                    )}
                    <div>
                      <h2 className="text-2xl font-headline">{vendor.name}</h2>
                      {vendor.location && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" />
                          {vendor.location}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-typewriter flex items-center gap-1 ${verificationBadge.color}`}>
                    <CheckCircle className="w-3 h-3" />
                    {verificationBadge.text}
                  </div>
                </div>

                {vendor.description && (
                  <p className="text-muted-foreground mb-4">{vendor.description}</p>
                )}

                {vendor.longDescription && (
                  <div className="prose prose-invert max-w-none mb-6">
                    <p className="text-foreground/80 whitespace-pre-wrap">{vendor.longDescription}</p>
                  </div>
                )}

                {vendor.specialties && (
                  <div className="mb-6">
                    <h3 className="text-sm font-typewriter text-muted-foreground mb-2">SPECIALTIES</h3>
                    <div className="flex flex-wrap gap-2">
                      {vendor.specialties.split(',').map((specialty, index) => (
                        <span 
                          key={index}
                          className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                        >
                          {specialty.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                <div className="border-t border-border pt-6">
                  <h3 className="text-sm font-typewriter text-muted-foreground mb-4">CONTACT INFORMATION</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {vendor.website && (
                      <a 
                        href={vendor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-background rounded-lg hover:bg-primary/5 transition-colors"
                      >
                        <Globe className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Website</p>
                          <p className="text-sm text-foreground flex items-center gap-1">
                            Visit Website <ExternalLink className="w-3 h-3" />
                          </p>
                        </div>
                      </a>
                    )}

                    {vendor.telegram && (
                      <a 
                        href={vendor.telegram.startsWith('http') ? vendor.telegram : `https://t.me/${vendor.telegram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-background rounded-lg hover:bg-primary/5 transition-colors"
                      >
                        <MessageCircle className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Telegram</p>
                          <p className="text-sm text-foreground">{vendor.telegram}</p>
                        </div>
                      </a>
                    )}

                    {vendor.email && (
                      <a 
                        href={`mailto:${vendor.email}`}
                        className="flex items-center gap-3 p-3 bg-background rounded-lg hover:bg-primary/5 transition-colors"
                      >
                        <Mail className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Email</p>
                          <p className="text-sm text-foreground">{vendor.email}</p>
                        </div>
                      </a>
                    )}

                    {vendor.phone && (
                      <a 
                        href={`tel:${vendor.phone}`}
                        className="flex items-center gap-3 p-3 bg-background rounded-lg hover:bg-primary/5 transition-colors"
                      >
                        <Phone className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <p className="text-sm text-foreground">{vendor.phone}</p>
                        </div>
                      </a>
                    )}

                    {vendor.discord && (
                      <a 
                        href={vendor.discord}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-background rounded-lg hover:bg-primary/5 transition-colors"
                      >
                        <MessageCircle className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Discord</p>
                          <p className="text-sm text-foreground flex items-center gap-1">
                            Join Server <ExternalLink className="w-3 h-3" />
                          </p>
                        </div>
                      </a>
                    )}

                    {vendor.instagram && (
                      <a 
                        href={vendor.instagram.startsWith('http') ? vendor.instagram : `https://instagram.com/${vendor.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-background rounded-lg hover:bg-primary/5 transition-colors"
                      >
                        <Instagram className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Instagram</p>
                          <p className="text-sm text-foreground">{vendor.instagram}</p>
                        </div>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Back Button */}
              <div className="text-center">
                <Link href="/dashboard">
                  <Button variant="outline" className="font-typewriter">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to All Vendors
                  </Button>
                </Link>
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
          </div>
        </div>
      </footer>
    </div>
  );
}
