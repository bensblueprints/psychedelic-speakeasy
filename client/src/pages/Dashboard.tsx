import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { 
  ExternalLink, 
  Lock, 
  Crown,
  Users,
  BookOpen,
  Store,
  Loader2,
  LogOut,
  ArrowLeft,
  MessageSquare,
  CheckCircle,
  Globe,
  Send,
  MapPin,
  Star,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase, Vendor, VendorCategory, Membership, MemberProfile, CommunitySpace } from "@/lib/supabase";

export default function Dashboard() {
  const { authUser, userProfile, isLoading: authLoading, isAdmin, signOut } = useAuth();
  const isAuthenticated = !!authUser;
  const user = userProfile;
  const [, setLocation] = useLocation();
  
  // Data states
  const [membership, setMembership] = useState<Membership | null>(null);
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorCategories, setVendorCategories] = useState<VendorCategory[]>([]);
  const [communitySpaces, setCommunitySpaces] = useState<CommunitySpace[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  
  // Loading
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    setLoading(true);

    try {
      // Only fetch user-specific data if we have a user profile
      if (user) {
        // Fetch membership (optional - may not exist)
        const { data: membershipData } = await supabase
          .from('memberships')
          .select('*')
          .eq('userId', user.id)
          .eq('status', 'active')
          .maybeSingle();
        setMembership(membershipData);

        // Fetch profile (optional - may not exist)
        const { data: profileData } = await supabase
          .from('member_profiles')
          .select('*')
          .eq('userId', user.id)
          .maybeSingle();
        setProfile(profileData);
      }

      // Fetch vendors
      const { data: vendorsData, error: vendorsError } = await supabase
        .from('vendors')
        .select('*')
        .eq('isActive', true)
        .order('sortOrder');
      if (vendorsError) console.error('Vendors error:', vendorsError);
      if (vendorsData) setVendors(vendorsData);

      // Fetch vendor categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('vendor_categories')
        .select('*')
        .eq('isActive', true)
        .order('sortOrder');
      if (categoriesError) console.error('Categories error:', categoriesError);
      if (categoriesData) setVendorCategories(categoriesData);

      // Fetch community spaces
      const { data: spacesData, error: spacesError } = await supabase
        .from('community_spaces')
        .select('*')
        .eq('isActive', true)
        .order('sortOrder');
      if (spacesError) console.error('Spaces error:', spacesError);
      if (spacesData) setCommunitySpaces(spacesData);

      // Fetch resources
      const { data: resourcesData, error: resourcesError } = await supabase
        .from('resources')
        .select('*')
        .eq('isActive', true)
        .order('sortOrder');
      if (resourcesError) console.error('Resources error:', resourcesError);
      if (resourcesData) setResources(resourcesData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setLocation("/");
  };

  // TODO: Enable membership check when payment is integrated
  // const hasMembership = !!membership;
  const hasMembership = true; // Grant access to all logged-in users for now

  // Auth check
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Lock className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-headline mb-4">Login Required</h1>
          <p className="text-muted-foreground mb-6">Please log in to access your dashboard.</p>
          <Link href="/login">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-headline">
              GO TO LOGIN
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
              <span className="text-xs font-typewriter text-muted-foreground uppercase tracking-widest hover:text-primary cursor-pointer flex items-center gap-2">
                <ArrowLeft className="w-3 h-3" />
                Back to Home
              </span>
            </Link>
            <div className="flex items-center gap-4">
              {isAdmin && (
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="font-typewriter text-xs">
                    <Shield className="w-3 h-3 mr-2" />
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
              MEMBER DASHBOARD
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8 md:py-12">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-headline mb-2">
                    Welcome, {user?.name || user?.email?.split('@')[0] || "Member"}!
                  </h2>
                  {hasMembership ? (
                    <div className="flex items-center gap-2">
                      <Crown className="w-5 h-5 text-primary" />
                      <span className="text-primary font-medium">Premium Member</span>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Free Member</p>
                  )}
                </div>
                {!hasMembership && (
                  <Link href="/join">
                    <Button className="bg-primary hover:bg-primary/90 font-headline">
                      <Crown className="w-4 h-4 mr-2" />
                      UPGRADE
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <Tabs defaultValue="vendors" className="space-y-6">
                <TabsList className="bg-card border border-border flex-wrap h-auto p-1">
                  <TabsTrigger value="vendors" className="font-typewriter text-xs">
                    <Store className="w-4 h-4 mr-2" />
                    VENDORS
                  </TabsTrigger>
                  <TabsTrigger value="community" className="font-typewriter text-xs">
                    <Users className="w-4 h-4 mr-2" />
                    COMMUNITY
                  </TabsTrigger>
                  <TabsTrigger value="resources" className="font-typewriter text-xs">
                    <BookOpen className="w-4 h-4 mr-2" />
                    RESOURCES
                  </TabsTrigger>
                </TabsList>

                {/* Vendors Tab */}
                <TabsContent value="vendors" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-headline">Vetted Vendors</h3>
                  </div>

                  {vendorCategories.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground bg-card border border-border rounded-lg">
                      <Store className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No vendor categories available yet.</p>
                      <p className="text-sm mt-2">Check back soon for our vetted vendor directory!</p>
                    </div>
                  ) : (
                    vendorCategories.map((category) => {
                      const categoryVendors = vendors.filter(v => v.categoryId === category.id);
                      if (categoryVendors.length === 0) return null;
                      
                      return (
                        <div key={category.id} className="space-y-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{category.icon}</span>
                            <h4 className="text-lg font-headline">{category.name}</h4>
                            <span className="text-xs text-muted-foreground">({categoryVendors.length})</span>
                          </div>
                          {category.description && (
                            <p className="text-sm text-muted-foreground">{category.description}</p>
                          )}
                          <div className="grid gap-4 md:grid-cols-2">
                            {categoryVendors.map((vendor) => {
                              const isLocked = vendor.isPremiumOnly && !hasMembership;
                              return (
                                <motion.div
                                  key={vendor.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={`bg-card border border-border rounded-lg p-4 ${
                                    isLocked ? 'opacity-60' : ''
                                  }`}
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <h5 className="font-medium">{vendor.name}</h5>
                                        {vendor.verificationStatus === 'verified' && (
                                          <CheckCircle className="w-4 h-4 text-green-500" />
                                        )}
                                        {vendor.verificationStatus === 'featured' && (
                                          <Star className="w-4 h-4 text-primary fill-primary" />
                                        )}
                                      </div>
                                      {vendor.location && (
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                          <MapPin className="w-3 h-3" />
                                          {vendor.location}
                                        </p>
                                      )}
                                    </div>
                                    {isLocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-3">
                                    {vendor.description?.slice(0, 120)}...
                                  </p>
                                  {vendor.rating > 0 && (
                                    <div className="flex items-center gap-1 mb-3">
                                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                      <span className="text-sm">{vendor.rating.toFixed(1)}</span>
                                      <span className="text-xs text-muted-foreground">
                                        ({vendor.reviewCount} reviews)
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex gap-2">
                                    {vendor.website && !isLocked && (
                                      <a 
                                        href={vendor.website} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                                      >
                                        <Globe className="w-3 h-3" />
                                        Website
                                      </a>
                                    )}
                                    {vendor.telegram && !isLocked && (
                                      <a 
                                        href={`https://t.me/${vendor.telegram.replace('@', '')}`}
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-xs text-primary hover:underline"
                                      >
                                        <Send className="w-3 h-3" />
                                        Telegram
                                      </a>
                                    )}
                                    {isLocked && (
                                      <Link href="/join">
                                        <span className="text-xs text-primary hover:underline cursor-pointer">
                                          Upgrade to view →
                                        </span>
                                      </Link>
                                    )}
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })
                  )}
                </TabsContent>

                {/* Community Tab */}
                <TabsContent value="community" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-headline">Community Forums</h3>
                    <Link href="/community">
                      <Button variant="outline" size="sm">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Enter Community
                      </Button>
                    </Link>
                  </div>

                  {communitySpaces.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground bg-card border border-border rounded-lg">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Community spaces coming soon!</p>
                      <p className="text-sm mt-2">Join discussions with fellow seekers.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      {communitySpaces.map((space) => (
                        <Link key={space.id} href={`/community?space=${space.slug}`}>
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-card border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-2xl">{space.icon}</span>
                              <div>
                                <h5 className="font-medium">{space.name}</h5>
                                <p className="text-xs text-muted-foreground">
                                  {space.postCount} posts
                                </p>
                              </div>
                            </div>
                            {space.description && (
                              <p className="text-sm text-muted-foreground">{space.description}</p>
                            )}
                          </motion.div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Profile preview */}
                  {profile && (
                    <div className="bg-card border border-border rounded-lg p-4">
                      <h4 className="font-headline mb-3">Your Profile</h4>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                          style={{ backgroundColor: profile.avatarColor }}
                        >
                          {profile.avatarIcon}
                        </div>
                        <div>
                          <p className="font-medium">{profile.displayName}</p>
                          <p className="text-xs text-muted-foreground">
                            {profile.postCount} posts • {profile.commentCount} comments
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Resources Tab */}
                <TabsContent value="resources" className="space-y-6">
                  <h3 className="text-xl font-headline">Learning Resources</h3>

                  {resources.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground bg-card border border-border rounded-lg">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Resources coming soon!</p>
                      <p className="text-sm mt-2">Guides, protocols, and educational materials.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {resources.map((resource) => {
                        const isLocked = resource.isPremiumOnly && !hasMembership;
                        return (
                          <motion.div
                            key={resource.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`bg-card border border-border rounded-lg p-4 ${
                              isLocked ? 'opacity-60' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-medium">{resource.title}</h5>
                              {isLocked && <Lock className="w-4 h-4 text-muted-foreground" />}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {resource.description?.slice(0, 100)}...
                            </p>
                            {isLocked ? (
                              <Link href="/join">
                                <span className="text-xs text-primary hover:underline cursor-pointer">
                                  Upgrade to access →
                                </span>
                              </Link>
                            ) : resource.url ? (
                              <a 
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-primary hover:underline"
                              >
                                <ExternalLink className="w-3 h-3" />
                                View Resource
                              </a>
                            ) : null}
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border mt-auto">
        <div className="container">
          <div className="text-center text-xs text-muted-foreground font-typewriter">
            <p>© 2026 The Psychedelic Speakeasy. Member Dashboard.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
