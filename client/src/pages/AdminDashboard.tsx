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
  Calendar
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
            <Tabs defaultValue="posts" className="space-y-6">
              <TabsList className="bg-card border border-border">
                <TabsTrigger value="posts" className="font-typewriter text-xs">
                  <FileText className="w-4 h-4 mr-2" />
                  BLOG POSTS
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
