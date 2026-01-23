import { useState } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { 
  Users, 
  FileText, 
  Mail,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Loader2,
  LogOut,
  ArrowLeft,
  Shield,
  Calendar,
  Store,
  BookOpen,
  Save,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminDashboard() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  
  const { data: membershipStatus, isLoading: statusLoading } = trpc.membership.status.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  
  const { data: allUsers, isLoading: usersLoading } = trpc.admin.users.useQuery(
    undefined,
    { enabled: membershipStatus?.isAdmin }
  );
  
  const { data: blogPosts, isLoading: postsLoading } = trpc.blog.adminList.useQuery(
    undefined,
    { enabled: membershipStatus?.isAdmin }
  );
  
  const { data: subscribers, isLoading: subscribersLoading } = trpc.subscriber.list.useQuery(
    undefined,
    { enabled: membershipStatus?.isAdmin }
  );

  // Vendor data
  const { data: vendors, isLoading: vendorsLoading } = trpc.vendors.list.useQuery(
    undefined,
    { enabled: membershipStatus?.isAdmin }
  );
  const { data: vendorCategories } = trpc.vendorCategories.list.useQuery();

  // Resource data
  const { data: resources, isLoading: resourcesLoading } = trpc.resources.list.useQuery(
    undefined,
    { enabled: membershipStatus?.isAdmin }
  );
  const { data: resourceCategories } = trpc.resourceCategories.list.useQuery();

  // Blog post form state
  const [newPost, setNewPost] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "",
    metaTitle: "",
    metaDescription: "",
    isPublished: false,
  });
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  // Vendor form state
  const [newVendor, setNewVendor] = useState({
    name: "",
    slug: "",
    categoryId: 0,
    description: "",
    longDescription: "",
    specialties: "",
    website: "",
    telegram: "",
    email: "",
    phone: "",
    discord: "",
    instagram: "",
    location: "",
    verificationStatus: "pending" as "pending" | "verified" | "featured" | "suspended",
  });
  const [isCreatingVendor, setIsCreatingVendor] = useState(false);
  const [editingVendor, setEditingVendor] = useState<typeof newVendor & { id: number } | null>(null);

  // Resource form state
  const [newResource, setNewResource] = useState({
    title: "",
    slug: "",
    categoryId: 0,
    resourceType: "book" as "book" | "guide" | "video" | "course" | "tool" | "website" | "podcast" | "other",
    description: "",
    url: "",
    affiliateUrl: "",
    author: "",
    isFeatured: false,
  });
  const [isCreatingResource, setIsCreatingResource] = useState(false);
  const [editingResource, setEditingResource] = useState<(typeof newResource & { id: number }) | null>(null);

  // Mutations
  const createPost = trpc.blog.create.useMutation({
    onSuccess: () => {
      toast.success("Blog post created!");
      utils.blog.adminList.invalidate();
      setNewPost({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        category: "",
        metaTitle: "",
        metaDescription: "",
        isPublished: false,
      });
      setIsCreatingPost(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create post");
    },
  });

  const deletePost = trpc.blog.delete.useMutation({
    onSuccess: () => {
      toast.success("Post deleted");
      utils.blog.adminList.invalidate();
    },
  });

  const updatePost = trpc.blog.update.useMutation({
    onSuccess: () => {
      toast.success("Post updated");
      utils.blog.adminList.invalidate();
    },
  });

  const grantMembership = trpc.admin.grantMembership.useMutation({
    onSuccess: () => {
      toast.success("Membership granted!");
      utils.admin.users.invalidate();
    },
  });

  // Vendor mutations
  const createVendor = trpc.vendors.create.useMutation({
    onSuccess: () => {
      toast.success("Vendor created!");
      utils.vendors.list.invalidate();
      setNewVendor({
        name: "",
        slug: "",
        categoryId: 0,
        description: "",
        longDescription: "",
        specialties: "",
        website: "",
        telegram: "",
        email: "",
        phone: "",
        discord: "",
        instagram: "",
        location: "",
        verificationStatus: "pending",
      });
      setIsCreatingVendor(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create vendor");
    },
  });

  const updateVendor = trpc.vendors.update.useMutation({
    onSuccess: () => {
      toast.success("Vendor updated!");
      utils.vendors.list.invalidate();
      setEditingVendor(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update vendor");
    },
  });

  const deleteVendor = trpc.vendors.delete.useMutation({
    onSuccess: () => {
      toast.success("Vendor deleted");
      utils.vendors.list.invalidate();
    },
  });

  // Resource mutations
  const createResource = trpc.resources.create.useMutation({
    onSuccess: () => {
      toast.success("Resource created!");
      utils.resources.list.invalidate();
      setNewResource({
        title: "",
        slug: "",
        categoryId: 0,
        resourceType: "book",
        description: "",
        url: "",
        affiliateUrl: "",
        author: "",
        isFeatured: false,
      });
      setIsCreatingResource(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create resource");
    },
  });

  const updateResource = trpc.resources.update.useMutation({
    onSuccess: () => {
      toast.success("Resource updated!");
      utils.resources.list.invalidate();
      setEditingResource(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update resource");
    },
  });

  const deleteResource = trpc.resources.delete.useMutation({
    onSuccess: () => {
      toast.success("Resource deleted");
      utils.resources.list.invalidate();
    },
  });

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
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

  // Not an admin
  if (!membershipStatus?.isAdmin) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-headline mb-4">Admin Access Required</h1>
          <p className="text-muted-foreground mb-6">
            You don't have permission to access this area.
          </p>
          <Link href="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
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
            <Link href="/dashboard">
              <span className="text-xs font-typewriter text-muted-foreground uppercase tracking-widest hover:text-primary cursor-pointer flex items-center gap-2">
                <ArrowLeft className="w-3 h-3" />
                Member Dashboard
              </span>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout} className="font-typewriter text-xs">
              <LogOut className="w-3 h-3 mr-2" />
              LOGOUT
            </Button>
          </div>
          <div className="text-center py-4 border-y border-border my-4">
            <h1 className="text-2xl md:text-4xl font-headline tracking-tight text-foreground">
              ADMIN DASHBOARD
            </h1>
            <p className="font-typewriter text-sm text-primary mt-2 tracking-widest">
              MANAGE YOUR COMMUNITY
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8 md:py-12">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <Tabs defaultValue="vendors" className="space-y-6">
              <TabsList className="bg-card border border-border flex-wrap h-auto gap-1 p-1">
                <TabsTrigger value="vendors" className="font-typewriter text-xs">
                  <Store className="w-4 h-4 mr-2" />
                  VENDORS
                </TabsTrigger>
                <TabsTrigger value="resources" className="font-typewriter text-xs">
                  <BookOpen className="w-4 h-4 mr-2" />
                  RESOURCES
                </TabsTrigger>
                <TabsTrigger value="posts" className="font-typewriter text-xs">
                  <FileText className="w-4 h-4 mr-2" />
                  BLOG
                </TabsTrigger>
                <TabsTrigger value="users" className="font-typewriter text-xs">
                  <Users className="w-4 h-4 mr-2" />
                  USERS
                </TabsTrigger>
                <TabsTrigger value="subscribers" className="font-typewriter text-xs">
                  <Mail className="w-4 h-4 mr-2" />
                  SUBSCRIBERS
                </TabsTrigger>
              </TabsList>

              {/* Vendors Tab */}
              <TabsContent value="vendors">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-headline">Vetted Vendors</h2>
                    <Dialog open={isCreatingVendor} onOpenChange={setIsCreatingVendor}>
                      <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Vendor
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Add New Vendor</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium mb-1 block">Name *</label>
                              <Input
                                value={newVendor.name}
                                onChange={(e) => setNewVendor({
                                  ...newVendor,
                                  name: e.target.value,
                                  slug: generateSlug(e.target.value),
                                })}
                                placeholder="Vendor name"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-1 block">Slug</label>
                              <Input
                                value={newVendor.slug}
                                onChange={(e) => setNewVendor({ ...newVendor, slug: e.target.value })}
                                placeholder="vendor-url-slug"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium mb-1 block">Category *</label>
                              <Select
                                value={newVendor.categoryId.toString()}
                                onValueChange={(value) => setNewVendor({ ...newVendor, categoryId: parseInt(value) })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {vendorCategories?.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id.toString()}>
                                      {cat.icon} {cat.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-1 block">Status</label>
                              <Select
                                value={newVendor.verificationStatus}
                                onValueChange={(value: typeof newVendor.verificationStatus) => 
                                  setNewVendor({ ...newVendor, verificationStatus: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="verified">Verified</SelectItem>
                                  <SelectItem value="featured">Featured</SelectItem>
                                  <SelectItem value="suspended">Suspended</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1 block">Short Description</label>
                            <Textarea
                              value={newVendor.description}
                              onChange={(e) => setNewVendor({ ...newVendor, description: e.target.value })}
                              placeholder="Brief description for listings"
                              rows={2}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1 block">Full Description</label>
                            <Textarea
                              value={newVendor.longDescription}
                              onChange={(e) => setNewVendor({ ...newVendor, longDescription: e.target.value })}
                              placeholder="Detailed description for vendor page"
                              rows={4}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium mb-1 block">Specialties</label>
                              <Input
                                value={newVendor.specialties}
                                onChange={(e) => setNewVendor({ ...newVendor, specialties: e.target.value })}
                                placeholder="e.g., Dried caps, Tinctures, Microdose"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-1 block">Location</label>
                              <Input
                                value={newVendor.location}
                                onChange={(e) => setNewVendor({ ...newVendor, location: e.target.value })}
                                placeholder="e.g., USA, Europe, Worldwide"
                              />
                            </div>
                          </div>
                          <div className="border-t border-border pt-4">
                            <h4 className="text-sm font-medium mb-3">Contact Information</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium mb-1 block">Website</label>
                                <Input
                                  value={newVendor.website}
                                  onChange={(e) => setNewVendor({ ...newVendor, website: e.target.value })}
                                  placeholder="https://..."
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-1 block">Telegram</label>
                                <Input
                                  value={newVendor.telegram}
                                  onChange={(e) => setNewVendor({ ...newVendor, telegram: e.target.value })}
                                  placeholder="@username or t.me/..."
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-1 block">Email</label>
                                <Input
                                  value={newVendor.email}
                                  onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                                  placeholder="contact@..."
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-1 block">Phone</label>
                                <Input
                                  value={newVendor.phone}
                                  onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                                  placeholder="+1..."
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-1 block">Discord</label>
                                <Input
                                  value={newVendor.discord}
                                  onChange={(e) => setNewVendor({ ...newVendor, discord: e.target.value })}
                                  placeholder="Discord invite link"
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-1 block">Instagram</label>
                                <Input
                                  value={newVendor.instagram}
                                  onChange={(e) => setNewVendor({ ...newVendor, instagram: e.target.value })}
                                  placeholder="@username"
                                />
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={() => createVendor.mutate(newVendor)}
                            disabled={createVendor.isPending || !newVendor.name || !newVendor.categoryId}
                            className="w-full"
                          >
                            {createVendor.isPending ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Plus className="w-4 h-4 mr-2" />
                            )}
                            Add Vendor
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {vendorsLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="bg-card border border-border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left p-4 font-typewriter text-xs">VENDOR</th>
                            <th className="text-left p-4 font-typewriter text-xs">CATEGORY</th>
                            <th className="text-left p-4 font-typewriter text-xs">STATUS</th>
                            <th className="text-left p-4 font-typewriter text-xs">CONTACT</th>
                            <th className="text-right p-4 font-typewriter text-xs">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vendors?.map((vendor) => (
                            <tr key={vendor.id} className="border-t border-border">
                              <td className="p-4">
                                <div className="font-medium">{vendor.name}</div>
                                <div className="text-xs text-muted-foreground">{vendor.location || 'No location'}</div>
                              </td>
                              <td className="p-4 text-sm">
                                {vendorCategories?.find(c => c.id === vendor.categoryId)?.name || 'Unknown'}
                              </td>
                              <td className="p-4">
                                <span className={`inline-block px-2 py-1 text-xs rounded ${
                                  vendor.verificationStatus === 'verified' ? 'bg-green-500/20 text-green-500' :
                                  vendor.verificationStatus === 'featured' ? 'bg-yellow-500/20 text-yellow-500' :
                                  vendor.verificationStatus === 'suspended' ? 'bg-red-500/20 text-red-500' :
                                  'bg-muted text-muted-foreground'
                                }`}>
                                  {vendor.verificationStatus.toUpperCase()}
                                </span>
                              </td>
                              <td className="p-4 text-sm text-muted-foreground">
                                {[vendor.website && 'Web', vendor.telegram && 'TG', vendor.email && 'Email']
                                  .filter(Boolean).join(', ') || 'None'}
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingVendor({
                                      id: vendor.id,
                                      name: vendor.name,
                                      slug: vendor.slug,
                                      categoryId: vendor.categoryId,
                                      description: vendor.description || '',
                                      longDescription: vendor.longDescription || '',
                                      specialties: vendor.specialties || '',
                                      website: vendor.website || '',
                                      telegram: vendor.telegram || '',
                                      email: vendor.email || '',
                                      phone: vendor.phone || '',
                                      discord: vendor.discord || '',
                                      instagram: vendor.instagram || '',
                                      location: vendor.location || '',
                                      verificationStatus: vendor.verificationStatus as typeof newVendor.verificationStatus,
                                    })}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      if (confirm('Are you sure you want to delete this vendor?')) {
                                        deleteVendor.mutate({ id: vendor.id });
                                      }
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {(!vendors || vendors.length === 0) && (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                No vendors yet. Add your first vendor!
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              </TabsContent>

              {/* Resources Tab */}
              <TabsContent value="resources">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-headline">Trusted Resources</h2>
                    <Dialog open={isCreatingResource} onOpenChange={setIsCreatingResource}>
                      <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Resource
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Add New Resource</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div>
                            <label className="text-sm font-medium mb-1 block">Title *</label>
                            <Input
                              value={newResource.title}
                              onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                              placeholder="Resource title"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium mb-1 block">Category *</label>
                              <Select
                                value={newResource.categoryId.toString()}
                                onValueChange={(value) => setNewResource({ ...newResource, categoryId: parseInt(value) })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  {resourceCategories?.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id.toString()}>
                                      {cat.icon} {cat.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-1 block">Type *</label>
                              <Select
                                value={newResource.resourceType}
                                onValueChange={(value: typeof newResource.resourceType) => 
                                  setNewResource({ ...newResource, resourceType: value })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="book">Book</SelectItem>
                                  <SelectItem value="guide">Guide</SelectItem>
                                  <SelectItem value="video">Video</SelectItem>
                                  <SelectItem value="course">Course</SelectItem>
                                  <SelectItem value="tool">Tool</SelectItem>
                                  <SelectItem value="website">Website</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1 block">Author</label>
                            <Input
                              value={newResource.author}
                              onChange={(e) => setNewResource({ ...newResource, author: e.target.value })}
                              placeholder="Author name"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1 block">Description</label>
                            <Textarea
                              value={newResource.description}
                              onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                              placeholder="Resource description"
                              rows={3}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1 block">URL</label>
                            <Input
                              value={newResource.url}
                              onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                              placeholder="https://..."
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1 block">Affiliate URL (Amazon, etc.)</label>
                            <Input
                              value={newResource.affiliateUrl}
                              onChange={(e) => setNewResource({ ...newResource, affiliateUrl: e.target.value })}
                              placeholder="https://amazon.com/...?tag=yourtag"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="isFeatured"
                              checked={newResource.isFeatured}
                              onChange={(e) => setNewResource({ ...newResource, isFeatured: e.target.checked })}
                            />
                            <label htmlFor="isFeatured" className="text-sm">Featured resource</label>
                          </div>
                          <Button
                            onClick={() => createResource.mutate({ ...newResource, slug: generateSlug(newResource.title) })}
                            disabled={createResource.isPending || !newResource.title || !newResource.categoryId}
                            className="w-full"
                          >
                            {createResource.isPending ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Plus className="w-4 h-4 mr-2" />
                            )}
                            Add Resource
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {resourcesLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="bg-card border border-border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left p-4 font-typewriter text-xs">RESOURCE</th>
                            <th className="text-left p-4 font-typewriter text-xs">TYPE</th>
                            <th className="text-left p-4 font-typewriter text-xs">CATEGORY</th>
                            <th className="text-left p-4 font-typewriter text-xs">FEATURED</th>
                            <th className="text-right p-4 font-typewriter text-xs">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resources?.map((resource) => (
                            <tr key={resource.id} className="border-t border-border">
                              <td className="p-4">
                                <div className="font-medium">{resource.title}</div>
                                <div className="text-xs text-muted-foreground">{resource.author || 'No author'}</div>
                              </td>
                              <td className="p-4 text-sm capitalize">{resource.resourceType}</td>
                              <td className="p-4 text-sm">
                                {resourceCategories?.find(c => c.id === resource.categoryId)?.name || 'Unknown'}
                              </td>
                              <td className="p-4">
                                {resource.isFeatured ? (
                                  <span className="text-yellow-500">★</span>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingResource({
                                      id: resource.id,
                                      title: resource.title,
                                      slug: resource.slug || generateSlug(resource.title),
                                      categoryId: resource.categoryId,
                                      resourceType: resource.resourceType as typeof newResource.resourceType,
                                      description: resource.description || '',
                                      url: resource.url || '',
                                      affiliateUrl: resource.affiliateUrl || '',
                                      author: resource.author || '',
                                      isFeatured: resource.isFeatured,
                                    })}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      if (confirm('Are you sure you want to delete this resource?')) {
                                        deleteResource.mutate({ id: resource.id });
                                      }
                                    }}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {(!resources || resources.length === 0) && (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                No resources yet. Add your first resource!
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              </TabsContent>

              {/* Blog Posts Tab */}
              <TabsContent value="posts">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-headline">Blog Posts</h2>
                    <Dialog open={isCreatingPost} onOpenChange={setIsCreatingPost}>
                      <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90">
                          <Plus className="w-4 h-4 mr-2" />
                          New Post
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Create New Blog Post</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                          <div>
                            <label className="text-sm font-medium mb-1 block">Title</label>
                            <Input
                              value={newPost.title}
                              onChange={(e) => {
                                setNewPost({
                                  ...newPost,
                                  title: e.target.value,
                                  slug: generateSlug(e.target.value),
                                });
                              }}
                              placeholder="Post title"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1 block">Slug</label>
                            <Input
                              value={newPost.slug}
                              onChange={(e) => setNewPost({ ...newPost, slug: e.target.value })}
                              placeholder="post-url-slug"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1 block">Category</label>
                            <Input
                              value={newPost.category}
                              onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                              placeholder="e.g., Amanita, Psilocybin, Research"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1 block">Excerpt</label>
                            <Textarea
                              value={newPost.excerpt}
                              onChange={(e) => setNewPost({ ...newPost, excerpt: e.target.value })}
                              placeholder="Brief summary for listings"
                              rows={2}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1 block">Content (Markdown)</label>
                            <Textarea
                              value={newPost.content}
                              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                              placeholder="Full post content in Markdown..."
                              rows={10}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1 block">Meta Title (SEO)</label>
                            <Input
                              value={newPost.metaTitle}
                              onChange={(e) => setNewPost({ ...newPost, metaTitle: e.target.value })}
                              placeholder="SEO title (60 chars max)"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1 block">Meta Description (SEO)</label>
                            <Textarea
                              value={newPost.metaDescription}
                              onChange={(e) => setNewPost({ ...newPost, metaDescription: e.target.value })}
                              placeholder="SEO description (160 chars max)"
                              rows={2}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="isPublished"
                              checked={newPost.isPublished}
                              onChange={(e) => setNewPost({ ...newPost, isPublished: e.target.checked })}
                            />
                            <label htmlFor="isPublished" className="text-sm">Publish immediately</label>
                          </div>
                          <Button
                            onClick={() => createPost.mutate(newPost)}
                            disabled={createPost.isPending || !newPost.title || !newPost.slug || !newPost.content}
                            className="w-full"
                          >
                            {createPost.isPending ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Plus className="w-4 h-4 mr-2" />
                            )}
                            Create Post
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {postsLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="bg-card border border-border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left p-4 font-typewriter text-xs">TITLE</th>
                            <th className="text-left p-4 font-typewriter text-xs">STATUS</th>
                            <th className="text-left p-4 font-typewriter text-xs">VIEWS</th>
                            <th className="text-left p-4 font-typewriter text-xs">DATE</th>
                            <th className="text-right p-4 font-typewriter text-xs">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {blogPosts?.map((post) => (
                            <tr key={post.id} className="border-t border-border">
                              <td className="p-4">
                                <div className="font-medium">{post.title}</div>
                                <div className="text-xs text-muted-foreground">/blog/{post.slug}</div>
                              </td>
                              <td className="p-4">
                                {post.isPublished ? (
                                  <span className="inline-flex items-center gap-1 text-green-500 text-xs">
                                    <Eye className="w-3 h-3" /> Published
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
                                    <EyeOff className="w-3 h-3" /> Draft
                                  </span>
                                )}
                              </td>
                              <td className="p-4 text-sm">{post.viewCount}</td>
                              <td className="p-4 text-sm text-muted-foreground">
                                {new Date(post.createdAt).toLocaleDateString()}
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updatePost.mutate({
                                      id: post.id,
                                      isPublished: !post.isPublished,
                                    })}
                                  >
                                    {post.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => deletePost.mutate({ id: post.id })}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {(!blogPosts || blogPosts.length === 0) && (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                No blog posts yet. Create your first post!
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="text-xl font-headline mb-6">Users</h2>
                  
                  {usersLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="bg-card border border-border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left p-4 font-typewriter text-xs">USER</th>
                            <th className="text-left p-4 font-typewriter text-xs">ROLE</th>
                            <th className="text-left p-4 font-typewriter text-xs">JOINED</th>
                            <th className="text-right p-4 font-typewriter text-xs">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allUsers?.map((u) => (
                            <tr key={u.id} className="border-t border-border">
                              <td className="p-4">
                                <div className="font-medium">{u.name || "Unknown"}</div>
                                <div className="text-xs text-muted-foreground">{u.email}</div>
                              </td>
                              <td className="p-4">
                                <span className={`inline-block px-2 py-1 text-xs rounded ${
                                  u.role === 'admin' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                                }`}>
                                  {u.role.toUpperCase()}
                                </span>
                              </td>
                              <td className="p-4 text-sm text-muted-foreground">
                                {new Date(u.createdAt).toLocaleDateString()}
                              </td>
                              <td className="p-4 text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => grantMembership.mutate({ userId: u.id })}
                                  disabled={grantMembership.isPending}
                                >
                                  <Calendar className="w-4 h-4 mr-2" />
                                  Grant 1yr
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              </TabsContent>

              {/* Subscribers Tab */}
              <TabsContent value="subscribers">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="text-xl font-headline mb-6">Email Subscribers</h2>
                  
                  {subscribersLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="bg-card border border-border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left p-4 font-typewriter text-xs">EMAIL</th>
                            <th className="text-left p-4 font-typewriter text-xs">STATUS</th>
                            <th className="text-left p-4 font-typewriter text-xs">SOURCE</th>
                            <th className="text-left p-4 font-typewriter text-xs">DATE</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subscribers?.map((sub) => (
                            <tr key={sub.id} className="border-t border-border">
                              <td className="p-4 font-medium">{sub.email}</td>
                              <td className="p-4">
                                <span className={`inline-block px-2 py-1 text-xs rounded ${
                                  sub.status === 'subscribed' ? 'bg-green-500/20 text-green-500' : 'bg-muted text-muted-foreground'
                                }`}>
                                  {sub.status.toUpperCase()}
                                </span>
                              </td>
                              <td className="p-4 text-sm text-muted-foreground">{sub.source}</td>
                              <td className="p-4 text-sm text-muted-foreground">
                                {new Date(sub.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                          {(!subscribers || subscribers.length === 0) && (
                            <tr>
                              <td colSpan={4} className="p-8 text-center text-muted-foreground">
                                No subscribers yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Edit Vendor Dialog */}
      <Dialog open={!!editingVendor} onOpenChange={(open) => !open && setEditingVendor(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Vendor</DialogTitle>
          </DialogHeader>
          {editingVendor && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Name *</label>
                  <Input
                    value={editingVendor.name}
                    onChange={(e) => setEditingVendor({ ...editingVendor, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Status</label>
                  <Select
                    value={editingVendor.verificationStatus}
                    onValueChange={(value: typeof editingVendor.verificationStatus) => 
                      setEditingVendor({ ...editingVendor, verificationStatus: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <Textarea
                  value={editingVendor.description}
                  onChange={(e) => setEditingVendor({ ...editingVendor, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Website</label>
                  <Input
                    value={editingVendor.website}
                    onChange={(e) => setEditingVendor({ ...editingVendor, website: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Telegram</label>
                  <Input
                    value={editingVendor.telegram}
                    onChange={(e) => setEditingVendor({ ...editingVendor, telegram: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Email</label>
                  <Input
                    value={editingVendor.email}
                    onChange={(e) => setEditingVendor({ ...editingVendor, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Phone</label>
                  <Input
                    value={editingVendor.phone}
                    onChange={(e) => setEditingVendor({ ...editingVendor, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    const { id, ...vendorData } = editingVendor;
                    updateVendor.mutate({ id, ...vendorData });
                  }}
                  disabled={updateVendor.isPending}
                  className="flex-1"
                >
                  {updateVendor.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingVendor(null)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Resource Dialog */}
      <Dialog open={!!editingResource} onOpenChange={(open) => !open && setEditingResource(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Resource</DialogTitle>
          </DialogHeader>
          {editingResource && (
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Title *</label>
                <Input
                  value={editingResource.title}
                  onChange={(e) => setEditingResource({ ...editingResource, title: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Type</label>
                  <Select
                    value={editingResource.resourceType}
                    onValueChange={(value: typeof editingResource.resourceType) => 
                      setEditingResource({ ...editingResource, resourceType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="book">Book</SelectItem>
                      <SelectItem value="guide">Guide</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="course">Course</SelectItem>
                      <SelectItem value="tool">Tool</SelectItem>
                      <SelectItem value="website">Website</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Author</label>
                  <Input
                    value={editingResource.author}
                    onChange={(e) => setEditingResource({ ...editingResource, author: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <Textarea
                  value={editingResource.description}
                  onChange={(e) => setEditingResource({ ...editingResource, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">URL</label>
                <Input
                  value={editingResource.url}
                  onChange={(e) => setEditingResource({ ...editingResource, url: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Affiliate URL</label>
                <Input
                  value={editingResource.affiliateUrl}
                  onChange={(e) => setEditingResource({ ...editingResource, affiliateUrl: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="editIsFeatured"
                  checked={editingResource.isFeatured}
                  onChange={(e) => setEditingResource({ ...editingResource, isFeatured: e.target.checked })}
                />
                <label htmlFor="editIsFeatured" className="text-sm">Featured resource</label>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    const { id, ...resourceData } = editingResource;
                    updateResource.mutate({ id, ...resourceData });
                  }}
                  disabled={updateResource.isPending}
                  className="flex-1"
                >
                  {updateResource.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingResource(null)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="py-8 border-t border-border mt-auto">
        <div className="container">
          <div className="text-center text-xs text-muted-foreground font-typewriter">
            <p>© 2026 The Psychedelic Speakeasy. Admin Dashboard.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
