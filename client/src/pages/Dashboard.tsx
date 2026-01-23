import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { 
  Shield, 
  BookOpen, 
  Users, 
  Calendar,
  ExternalLink,
  Star,
  CheckCircle,
  Lock,
  Loader2,
  LogOut,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: membershipStatus, isLoading: statusLoading } = trpc.membership.status.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  
  const { data: vendors, isLoading: vendorsLoading } = trpc.members.vendors.useQuery(
    undefined,
    { enabled: membershipStatus?.hasMembership }
  );
  
  const { data: guides, isLoading: guidesLoading } = trpc.members.guides.useQuery(
    undefined,
    { enabled: membershipStatus?.hasMembership }
  );

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  // Redirect to login if not authenticated
  if (!authLoading && !isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  // Loading state
  if (authLoading || statusLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not a member - redirect to join
  if (!membershipStatus?.hasMembership) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Lock className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-headline mb-4">Membership Required</h1>
          <p className="text-muted-foreground mb-6">
            You need an active membership to access the member area.
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
            <div className="flex items-center gap-4">
              {membershipStatus?.isAdmin && (
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="font-typewriter text-xs">
                    <Settings className="w-3 h-3 mr-2" />
                    ADMIN
                  </Button>
                </Link>
              )}
              <Button variant="outline" size="sm" onClick={handleLogout} className="font-typewriter text-xs">
                <LogOut className="w-3 h-3 mr-2" />
                LOGOUT
              </Button>
            </div>
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
          <div className="max-w-5xl mx-auto">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-headline mb-2">
                Welcome back, {user?.name || "Member"}!
              </h2>
              <p className="text-muted-foreground">
                Access your exclusive member content below.
              </p>
            </motion.div>

            {/* Tabs */}
            <Tabs defaultValue="vendors" className="space-y-6">
              <TabsList className="bg-card border border-border">
                <TabsTrigger value="vendors" className="font-typewriter text-xs">
                  <Shield className="w-4 h-4 mr-2" />
                  VETTED VENDORS
                </TabsTrigger>
                <TabsTrigger value="guides" className="font-typewriter text-xs">
                  <BookOpen className="w-4 h-4 mr-2" />
                  GUIDES
                </TabsTrigger>
                <TabsTrigger value="community" className="font-typewriter text-xs">
                  <Users className="w-4 h-4 mr-2" />
                  COMMUNITY
                </TabsTrigger>
              </TabsList>

              {/* Vendors Tab */}
              <TabsContent value="vendors">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-8"
                >
                  {vendorsLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <>
                      {/* Amanita Vendors */}
                      <div>
                        <h3 className="text-xl font-headline mb-4 flex items-center gap-2">
                          <span className="inline-block bg-primary/20 text-primary px-3 py-1 text-xs font-typewriter">
                            AMANITA MUSCARIA
                          </span>
                          Vetted Suppliers
                        </h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {vendors?.amanita.map((vendor, index) => (
                            <div key={index} className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-headline">{vendor.name}</h4>
                                {vendor.verified && (
                                  <CheckCircle className="w-5 h-5 text-green-500" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">{vendor.specialty}</p>
                              <div className="flex items-center gap-1 text-sm">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span>{vendor.rating}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Psilocybin Vendors */}
                      <div>
                        <h3 className="text-xl font-headline mb-4 flex items-center gap-2">
                          <span className="inline-block bg-accent/20 text-accent-foreground px-3 py-1 text-xs font-typewriter">
                            PSILOCYBIN
                          </span>
                          Trusted Resources
                        </h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {vendors?.psilocybin.map((vendor, index) => (
                            <div key={index} className="bg-card border border-border rounded-lg p-4 hover:border-accent/50 transition-colors">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-headline">{vendor.name}</h4>
                                {vendor.verified && (
                                  <CheckCircle className="w-5 h-5 text-green-500" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">{vendor.specialty}</p>
                              <div className="flex items-center gap-1 text-sm">
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                <span>{vendor.rating}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              </TabsContent>

              {/* Guides Tab */}
              <TabsContent value="guides">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {guidesLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                      {guides?.map((guide) => (
                        <div key={guide.id} className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors cursor-pointer">
                          <span className="inline-block bg-primary/20 text-primary px-2 py-0.5 text-xs font-typewriter mb-3">
                            {guide.category.toUpperCase()}
                          </span>
                          <h4 className="font-headline text-lg mb-2">{guide.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-primary">
                            <BookOpen className="w-4 h-4" />
                            Read Guide
                            <ExternalLink className="w-3 h-3" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </TabsContent>

              {/* Community Tab */}
              <TabsContent value="community">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="bg-card border border-border rounded-lg p-6">
                    <h3 className="text-xl font-headline mb-4">Private Discussion Forums</h3>
                    <p className="text-muted-foreground mb-4">
                      Connect with fellow members in our private community forums. Share experiences, 
                      ask questions, and support each other on your healing journey.
                    </p>
                    <Button variant="outline" className="font-typewriter">
                      <Users className="w-4 h-4 mr-2" />
                      ACCESS FORUMS
                      <ExternalLink className="w-3 h-3 ml-2" />
                    </Button>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6">
                    <h3 className="text-xl font-headline mb-4">Monthly Live Q&A Sessions</h3>
                    <p className="text-muted-foreground mb-4">
                      Join our monthly live sessions with experienced practitioners and researchers.
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <Calendar className="w-4 h-4" />
                      <span>Next session: February 1, 2026 at 7:00 PM EST</span>
                    </div>
                    <Button variant="outline" className="font-typewriter">
                      <Calendar className="w-4 h-4 mr-2" />
                      VIEW SCHEDULE
                    </Button>
                  </div>
                </motion.div>
              </TabsContent>
            </Tabs>
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
