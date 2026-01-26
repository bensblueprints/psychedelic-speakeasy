import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  Store,
  BookOpen,
  Save,
  X,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/_core/hooks/useAuth";
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
import { supabase, User, Vendor, VendorCategory, BlogPost } from "@/lib/supabase";

export default function AdminDashboard() {
  const { user, isAuthenticated, isAdmin, loading: authLoading, logout } = useAuth();
  const [, setLocation] = useLocation();
  
  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorCategories, setVendorCategories] = useState<VendorCategory[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  
  // Loading states
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingSubscribers, setLoadingSubscribers] = useState(true);
  
  // Modal states
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [showAddPost, setShowAddPost] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  
  // Form states
  const [vendorForm, setVendorForm] = useState({
    name: "",
    slug: "",
    categoryId: "",
    description: "",
    website: "",
    telegram: "",
    email: "",
    location: "",
    specialties: "",
    verificationStatus: "pending" as const,
  });
  
  const [postForm, setPostForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "",
    isPublished: false,
  });

  // Fetch all data
  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchVendors();
      fetchVendorCategories();
      fetchBlogPosts();
      fetchSubscribers();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('createdAt', { ascending: false });
    
    if (!error && data) setUsers(data);
    setLoadingUsers(false);
  };

  const fetchVendors = async () => {
    setLoadingVendors(true);
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .order('sortOrder');
    
    if (!error && data) setVendors(data);
    setLoadingVendors(false);
  };

  const fetchVendorCategories = async () => {
    const { data, error } = await supabase
      .from('vendor_categories')
      .select('*')
      .order('sortOrder');
    
    if (!error && data) setVendorCategories(data);
  };

  const fetchBlogPosts = async () => {
    setLoadingPosts(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('createdAt', { ascending: false });
    
    if (!error && data) setBlogPosts(data);
    setLoadingPosts(false);
  };

  const fetchSubscribers = async () => {
    setLoadingSubscribers(true);
    const { data, error } = await supabase
      .from('email_subscribers')
      .select('*')
      .order('createdAt', { ascending: false });
    
    if (!error && data) setSubscribers(data);
    setLoadingSubscribers(false);
  };

  // User actions
  const updateUserRole = async (userId: number, role: 'user' | 'admin') => {
    const { error } = await supabase
      .from('users')
      .update({ role, updatedAt: new Date().toISOString() })
      .eq('id', userId);
    
    if (error) {
      toast.error('Failed to update user role');
    } else {
      toast.success('User role updated');
      fetchUsers();
    }
  };

  // Vendor actions
  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase.from('vendors').insert({
      ...vendorForm,
      categoryId: parseInt(vendorForm.categoryId),
      slug: vendorForm.slug || vendorForm.name.toLowerCase().replace(/\s+/g, '-'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    if (error) {
      toast.error('Failed to add vendor: ' + error.message);
    } else {
      toast.success('Vendor added successfully');
      setShowAddVendor(false);
      setVendorForm({
        name: "",
        slug: "",
        categoryId: "",
        description: "",
        website: "",
        telegram: "",
        email: "",
        location: "",
        specialties: "",
        verificationStatus: "pending",
      });
      fetchVendors();
    }
  };

  const handleUpdateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVendor) return;
    
    const { error } = await supabase
      .from('vendors')
      .update({
        ...vendorForm,
        categoryId: parseInt(vendorForm.categoryId),
        updatedAt: new Date().toISOString(),
      })
      .eq('id', editingVendor.id);
    
    if (error) {
      toast.error('Failed to update vendor');
    } else {
      toast.success('Vendor updated successfully');
      setEditingVendor(null);
      fetchVendors();
    }
  };

  const deleteVendor = async (vendorId: number) => {
    if (!confirm('Are you sure you want to delete this vendor?')) return;
    
    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', vendorId);
    
    if (error) {
      toast.error('Failed to delete vendor');
    } else {
      toast.success('Vendor deleted');
      fetchVendors();
    }
  };

  // Blog post actions
  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase.from('blog_posts').insert({
      ...postForm,
      slug: postForm.slug || postForm.title.toLowerCase().replace(/\s+/g, '-'),
      publishedAt: postForm.isPublished ? new Date().toISOString() : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    if (error) {
      toast.error('Failed to add post: ' + error.message);
    } else {
      toast.success('Post added successfully');
      setShowAddPost(false);
      setPostForm({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        category: "",
        isPublished: false,
      });
      fetchBlogPosts();
    }
  };

  const togglePostPublished = async (postId: number, isPublished: boolean) => {
    const { error } = await supabase
      .from('blog_posts')
      .update({ 
        isPublished: !isPublished,
        publishedAt: !isPublished ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', postId);
    
    if (error) {
      toast.error('Failed to update post');
    } else {
      toast.success(isPublished ? 'Post unpublished' : 'Post published');
      fetchBlogPosts();
    }
  };

  const deletePost = async (postId: number) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', postId);
    
    if (error) {
      toast.error('Failed to delete post');
    } else {
      toast.success('Post deleted');
      fetchBlogPosts();
    }
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  // Auth checks
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
          <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-headline mb-4">Admin Login Required</h1>
          <p className="text-muted-foreground mb-6">Please log in to access the admin dashboard.</p>
          <Link href="/login">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-headline">
              GO TO LOGIN
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Shield className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-3xl font-headline mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You don't have admin privileges.</p>
          <Link href="/dashboard">
            <Button variant="outline">Go to Dashboard</Button>
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
              <Link href="/dashboard">
                <Button variant="outline" size="sm" className="font-typewriter text-xs">
                  USER DASHBOARD
                </Button>
              </Link>
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
            <p className="font-typewriter text-sm text-destructive mt-2 tracking-widest">
              ADMIN DASHBOARD
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8 md:py-12">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            {/* Welcome */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-headline mb-2">
                Welcome, {user?.name || user?.email || "Admin"}!
              </h2>
              <p className="text-muted-foreground">
                Manage vendors, users, blog posts, and more.
              </p>
            </motion.div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-card border border-border rounded-lg p-4">
                <Users className="w-6 h-6 text-primary mb-2" />
                <p className="text-2xl font-headline">{users.length}</p>
                <p className="text-xs text-muted-foreground">Users</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <Store className="w-6 h-6 text-primary mb-2" />
                <p className="text-2xl font-headline">{vendors.length}</p>
                <p className="text-xs text-muted-foreground">Vendors</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <FileText className="w-6 h-6 text-primary mb-2" />
                <p className="text-2xl font-headline">{blogPosts.length}</p>
                <p className="text-xs text-muted-foreground">Blog Posts</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <Mail className="w-6 h-6 text-primary mb-2" />
                <p className="text-2xl font-headline">{subscribers.length}</p>
                <p className="text-xs text-muted-foreground">Subscribers</p>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="vendors" className="space-y-6">
              <TabsList className="bg-card border border-border">
                <TabsTrigger value="vendors" className="font-typewriter text-xs">
                  <Store className="w-4 h-4 mr-2" />
                  VENDORS
                </TabsTrigger>
                <TabsTrigger value="users" className="font-typewriter text-xs">
                  <Users className="w-4 h-4 mr-2" />
                  USERS
                </TabsTrigger>
                <TabsTrigger value="posts" className="font-typewriter text-xs">
                  <FileText className="w-4 h-4 mr-2" />
                  BLOG POSTS
                </TabsTrigger>
                <TabsTrigger value="subscribers" className="font-typewriter text-xs">
                  <Mail className="w-4 h-4 mr-2" />
                  SUBSCRIBERS
                </TabsTrigger>
              </TabsList>

              {/* Vendors Tab */}
              <TabsContent value="vendors">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-headline">Manage Vendors</h3>
                  <Dialog open={showAddVendor} onOpenChange={setShowAddVendor}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Vendor
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Add New Vendor</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddVendor} className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Name *</label>
                          <Input
                            value={vendorForm.name}
                            onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Category *</label>
                          <Select
                            value={vendorForm.categoryId}
                            onValueChange={(v) => setVendorForm({ ...vendorForm, categoryId: v })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {vendorCategories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id.toString()}>
                                  {cat.icon} {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Description</label>
                          <Textarea
                            value={vendorForm.description}
                            onChange={(e) => setVendorForm({ ...vendorForm, description: e.target.value })}
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Website</label>
                            <Input
                              value={vendorForm.website}
                              onChange={(e) => setVendorForm({ ...vendorForm, website: e.target.value })}
                              placeholder="https://..."
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Telegram</label>
                            <Input
                              value={vendorForm.telegram}
                              onChange={(e) => setVendorForm({ ...vendorForm, telegram: e.target.value })}
                              placeholder="@username"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Email</label>
                            <Input
                              type="email"
                              value={vendorForm.email}
                              onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Location</label>
                            <Input
                              value={vendorForm.location}
                              onChange={(e) => setVendorForm({ ...vendorForm, location: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Verification Status</label>
                          <Select
                            value={vendorForm.verificationStatus}
                            onValueChange={(v: any) => setVendorForm({ ...vendorForm, verificationStatus: v })}
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
                        <div className="flex gap-2">
                          <Button type="submit" className="flex-1">
                            <Save className="w-4 h-4 mr-2" />
                            Save Vendor
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setShowAddVendor(false)}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {loadingVendors ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : vendors.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Store className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No vendors yet. Add your first vendor above.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {vendors.map((vendor) => (
                      <div key={vendor.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{vendor.name}</h4>
                            {vendor.verificationStatus === 'verified' && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                            {vendor.verificationStatus === 'featured' && (
                              <CheckCircle className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{vendor.description?.slice(0, 100)}...</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Category: {vendorCategories.find(c => c.id === vendor.categoryId)?.name || 'Unknown'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingVendor(vendor);
                              setVendorForm({
                                name: vendor.name,
                                slug: vendor.slug,
                                categoryId: vendor.categoryId.toString(),
                                description: vendor.description || "",
                                website: vendor.website || "",
                                telegram: vendor.telegram || "",
                                email: vendor.email || "",
                                location: vendor.location || "",
                                specialties: vendor.specialties || "",
                                verificationStatus: vendor.verificationStatus,
                              });
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteVendor(vendor.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users">
                <h3 className="text-xl font-headline mb-4">Manage Users</h3>
                {loadingUsers ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {users.map((u) => (
                      <div key={u.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{u.name || u.email}</h4>
                            {u.role === 'admin' && (
                              <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded">Admin</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{u.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Joined: {new Date(u.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Select
                          value={u.role}
                          onValueChange={(v: 'user' | 'admin') => updateUserRole(u.id, v)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Blog Posts Tab */}
              <TabsContent value="posts">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-headline">Manage Blog Posts</h3>
                  <Dialog open={showAddPost} onOpenChange={setShowAddPost}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Post
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Add New Blog Post</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleAddPost} className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Title *</label>
                          <Input
                            value={postForm.title}
                            onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Slug (auto-generated if empty)</label>
                          <Input
                            value={postForm.slug}
                            onChange={(e) => setPostForm({ ...postForm, slug: e.target.value })}
                            placeholder="my-blog-post"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Category</label>
                          <Input
                            value={postForm.category}
                            onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}
                            placeholder="Research, Education, Guides..."
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Excerpt</label>
                          <Textarea
                            value={postForm.excerpt}
                            onChange={(e) => setPostForm({ ...postForm, excerpt: e.target.value })}
                            rows={2}
                            placeholder="Brief description..."
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Content *</label>
                          <Textarea
                            value={postForm.content}
                            onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
                            rows={10}
                            placeholder="Full article content (supports markdown)..."
                            required
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="isPublished"
                            checked={postForm.isPublished}
                            onChange={(e) => setPostForm({ ...postForm, isPublished: e.target.checked })}
                          />
                          <label htmlFor="isPublished" className="text-sm">Publish immediately</label>
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" className="flex-1">
                            <Save className="w-4 h-4 mr-2" />
                            Save Post
                          </Button>
                          <Button type="button" variant="outline" onClick={() => setShowAddPost(false)}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>

                {loadingPosts ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : blogPosts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No blog posts yet. Create your first post above.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {blogPosts.map((post) => (
                      <div key={post.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{post.title}</h4>
                            {post.isPublished ? (
                              <span className="px-2 py-0.5 bg-green-500/20 text-green-500 text-xs rounded">Published</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded">Draft</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{post.excerpt?.slice(0, 100)}...</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Views: {post.viewCount} • Category: {post.category || 'Uncategorized'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => togglePostPublished(post.id, post.isPublished)}
                          >
                            {post.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deletePost(post.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Subscribers Tab */}
              <TabsContent value="subscribers">
                <h3 className="text-xl font-headline mb-4">Email Subscribers ({subscribers.length})</h3>
                {loadingSubscribers ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : subscribers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No subscribers yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {subscribers.map((sub) => (
                      <div key={sub.id} className="bg-card border border-border rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{sub.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {sub.firstName && `${sub.firstName} • `}
                            Source: {sub.source || 'Unknown'} • 
                            Joined: {new Date(sub.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 text-xs rounded ${
                          sub.status === 'subscribed' 
                            ? 'bg-green-500/20 text-green-500' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {sub.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      {/* Edit Vendor Dialog */}
      <Dialog open={!!editingVendor} onOpenChange={() => setEditingVendor(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Vendor</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateVendor} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={vendorForm.name}
                onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category *</label>
              <Select
                value={vendorForm.categoryId}
                onValueChange={(v) => setVendorForm({ ...vendorForm, categoryId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {vendorCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={vendorForm.description}
                onChange={(e) => setVendorForm({ ...vendorForm, description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Verification Status</label>
              <Select
                value={vendorForm.verificationStatus}
                onValueChange={(v: any) => setVendorForm({ ...vendorForm, verificationStatus: v })}
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
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Update Vendor
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditingVendor(null)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="py-8 border-t border-border mt-auto">
        <div className="container">
          <div className="text-center text-xs text-muted-foreground font-typewriter">
            <p>© 2026 The Psychedelic Speakeasy. Admin Panel.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
