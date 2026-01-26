import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useSearch } from "wouter";
import { 
  MessageSquare,
  Heart,
  Send,
  Loader2,
  LogOut,
  ArrowLeft,
  Plus,
  X,
  Eye,
  Lock,
  Users,
  Clock,
  ChevronLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
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
import { supabase, CommunitySpace, CommunityPost, PostComment, MemberProfile } from "@/lib/supabase";

export default function Community() {
  const { authUser, userProfile, isLoading: authLoading, signOut } = useAuth();
  const isAuthenticated = !!authUser;
  const user = userProfile;
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const spaceSlug = params.get('space');
  
  // Data states
  const [spaces, setSpaces] = useState<CommunitySpace[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<CommunitySpace | null>(null);
  const [posts, setPosts] = useState<(CommunityPost & { author?: MemberProfile })[]>([]);
  const [selectedPost, setSelectedPost] = useState<(CommunityPost & { author?: MemberProfile }) | null>(null);
  const [comments, setComments] = useState<(PostComment & { author?: MemberProfile })[]>([]);
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [memberCount, setMemberCount] = useState(0);
  
  // Loading states
  const [loadingSpaces, setLoadingSpaces] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Modal states
  const [showNewPost, setShowNewPost] = useState(false);
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  
  // Form states
  const [newPostForm, setNewPostForm] = useState({
    title: "",
    content: "",
    spaceId: "",
    isAnonymous: false,
  });
  const [newComment, setNewComment] = useState("");
  const [profileForm, setProfileForm] = useState({
    displayName: "",
    bio: "",
    avatarIcon: "🍄",
    avatarColor: "#7c3aed",
    journeyStage: "researching" as const,
  });

  // Avatar options
  const avatarIcons = ["🍄", "🌿", "🌙", "🔮", "🌸", "🌊", "🦋", "⭐", "🌈", "🕊️"];
  const avatarColors = ["#7c3aed", "#059669", "#2563eb", "#dc2626", "#d97706", "#7c2d12", "#4f46e5", "#0891b2"];

  // Fetch spaces on load
  useEffect(() => {
    fetchSpaces();
    fetchMemberCount();
  }, []);

  // Fetch user profile when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProfile();
    }
  }, [isAuthenticated, user]);

  // Select space based on URL param
  useEffect(() => {
    if (spaceSlug && spaces.length > 0) {
      const space = spaces.find(s => s.slug === spaceSlug);
      if (space) {
        setSelectedSpace(space);
        fetchPosts(space.id);
      }
    }
  }, [spaceSlug, spaces]);

  const fetchSpaces = async () => {
    setLoadingSpaces(true);
    const { data, error } = await supabase
      .from('community_spaces')
      .select('*')
      .eq('isActive', true)
      .order('sortOrder');
    
    if (!error && data) setSpaces(data);
    setLoadingSpaces(false);
  };

  const fetchMemberCount = async () => {
    const { count } = await supabase
      .from('member_profiles')
      .select('*', { count: 'exact', head: true });
    if (count) setMemberCount(count);
  };

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('member_profiles')
      .select('*')
      .eq('userId', user.id)
      .single();
    setProfile(data);
  };

  const fetchPosts = async (spaceId: number) => {
    setLoadingPosts(true);
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .eq('spaceId', spaceId)
      .order('isPinned', { ascending: false })
      .order('createdAt', { ascending: false });
    
    if (!error && data) {
      // Fetch authors for posts
      const authorIds = [...new Set(data.map(p => p.authorId))];
      const { data: authors } = await supabase
        .from('member_profiles')
        .select('*')
        .in('id', authorIds);
      
      const postsWithAuthors = data.map(post => ({
        ...post,
        author: authors?.find(a => a.id === post.authorId),
      }));
      setPosts(postsWithAuthors);
    }
    setLoadingPosts(false);
  };

  const fetchComments = async (postId: number) => {
    setLoadingComments(true);
    const { data, error } = await supabase
      .from('post_comments')
      .select('*')
      .eq('postId', postId)
      .order('createdAt');
    
    if (!error && data) {
      const authorIds = [...new Set(data.map(c => c.authorId))];
      const { data: authors } = await supabase
        .from('member_profiles')
        .select('*')
        .in('id', authorIds);
      
      const commentsWithAuthors = data.map(comment => ({
        ...comment,
        author: authors?.find(a => a.id === comment.authorId),
      }));
      setComments(commentsWithAuthors);
    }
    setLoadingComments(false);
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    const { error } = await supabase.from('member_profiles').insert({
      userId: user.id,
      displayName: profileForm.displayName,
      bio: profileForm.bio || null,
      avatarIcon: profileForm.avatarIcon,
      avatarColor: profileForm.avatarColor,
      journeyStage: profileForm.journeyStage,
      isPublic: true,
      postCount: 0,
      commentCount: 0,
      joinedAt: new Date().toISOString(),
    });

    if (error) {
      toast.error('Failed to create profile: ' + error.message);
    } else {
      toast.success('Profile created!');
      setShowCreateProfile(false);
      fetchProfile();
    }
    setSubmitting(false);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) {
      toast.error('Please create a profile first');
      return;
    }
    setSubmitting(true);

    const { error } = await supabase.from('community_posts').insert({
      spaceId: parseInt(newPostForm.spaceId) || selectedSpace?.id,
      authorId: profile.id,
      title: newPostForm.title,
      content: newPostForm.content,
      isAnonymous: newPostForm.isAnonymous,
      isPinned: false,
      likeCount: 0,
      commentCount: 0,
      viewCount: 0,
      createdAt: new Date().toISOString(),
    });

    if (error) {
      toast.error('Failed to create post: ' + error.message);
    } else {
      toast.success('Post created!');
      setShowNewPost(false);
      setNewPostForm({ title: "", content: "", spaceId: "", isAnonymous: false });
      
      // Update post count in space
      if (selectedSpace) {
        await supabase
          .from('community_spaces')
          .update({ postCount: selectedSpace.postCount + 1 })
          .eq('id', selectedSpace.id);
        fetchPosts(selectedSpace.id);
      }
      
      // Update profile post count
      await supabase
        .from('member_profiles')
        .update({ postCount: profile.postCount + 1 })
        .eq('id', profile.id);
    }
    setSubmitting(false);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !selectedPost) {
      toast.error('Please create a profile first');
      return;
    }
    setSubmitting(true);

    const { error } = await supabase.from('post_comments').insert({
      postId: selectedPost.id,
      authorId: profile.id,
      content: newComment,
      isAnonymous: false,
      likeCount: 0,
      createdAt: new Date().toISOString(),
    });

    if (error) {
      toast.error('Failed to post comment: ' + error.message);
    } else {
      toast.success('Comment posted!');
      setNewComment("");
      
      // Update comment count
      await supabase
        .from('community_posts')
        .update({ commentCount: selectedPost.commentCount + 1 })
        .eq('id', selectedPost.id);
      
      await supabase
        .from('member_profiles')
        .update({ commentCount: profile.commentCount + 1 })
        .eq('id', profile.id);
      
      fetchComments(selectedPost.id);
    }
    setSubmitting(false);
  };

  const handleLikePost = async (postId: number, currentLikes: number) => {
    if (!profile) {
      toast.error('Please create a profile first');
      return;
    }

    // Check if already liked
    const { data: existingLike } = await supabase
      .from('post_likes')
      .select('*')
      .eq('postId', postId)
      .eq('profileId', profile.id)
      .single();

    if (existingLike) {
      // Unlike
      await supabase.from('post_likes').delete().eq('id', existingLike.id);
      await supabase
        .from('community_posts')
        .update({ likeCount: currentLikes - 1 })
        .eq('id', postId);
    } else {
      // Like
      await supabase.from('post_likes').insert({
        postId,
        profileId: profile.id,
        createdAt: new Date().toISOString(),
      });
      await supabase
        .from('community_posts')
        .update({ likeCount: currentLikes + 1 })
        .eq('id', postId);
    }

    if (selectedSpace) {
      fetchPosts(selectedSpace.id);
    }
  };

  const openPost = async (post: CommunityPost & { author?: MemberProfile }) => {
    setSelectedPost(post);
    
    // Increment view count
    await supabase
      .from('community_posts')
      .update({ viewCount: post.viewCount + 1 })
      .eq('id', post.id);
    
    fetchComments(post.id);
  };

  const handleLogout = async () => {
    await signOut();
    setLocation("/");
  };

  // Time ago helper
  const timeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

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
          <p className="text-muted-foreground mb-6">Join our community to participate in discussions.</p>
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
            <Link href="/dashboard">
              <span className="text-xs font-typewriter text-muted-foreground uppercase tracking-widest hover:text-primary cursor-pointer flex items-center gap-2">
                <ArrowLeft className="w-3 h-3" />
                Dashboard
              </span>
            </Link>
            <Button variant="outline" size="sm" onClick={handleLogout} className="font-typewriter text-xs">
              <LogOut className="w-3 h-3 mr-2" />
              LOGOUT
            </Button>
          </div>
          <div className="text-center py-4 border-y border-border my-4">
            <Link href="/">
              <h1 className="text-2xl md:text-4xl font-headline tracking-tight text-foreground hover:text-primary transition-colors cursor-pointer">
                THE PSYCHEDELIC SPEAKEASY
              </h1>
            </Link>
            <p className="font-typewriter text-sm text-primary mt-2 tracking-widest">
              COMMUNITY FORUM
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            {/* Stats Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{memberCount} members</span>
                </div>
              </div>
              
              {!profile ? (
                <Dialog open={showCreateProfile} onOpenChange={setShowCreateProfile}>
                  <DialogTrigger asChild>
                    <Button size="sm">Create Profile</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Your Profile</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateProfile} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Display Name *</label>
                        <Input
                          value={profileForm.displayName}
                          onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                          placeholder="Your community name"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Avatar Icon</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {avatarIcons.map((icon) => (
                            <button
                              key={icon}
                              type="button"
                              onClick={() => setProfileForm({ ...profileForm, avatarIcon: icon })}
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all ${
                                profileForm.avatarIcon === icon
                                  ? 'ring-2 ring-primary scale-110'
                                  : 'hover:scale-105'
                              }`}
                              style={{ backgroundColor: profileForm.avatarColor }}
                            >
                              {icon}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Avatar Color</label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {avatarColors.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setProfileForm({ ...profileForm, avatarColor: color })}
                              className={`w-8 h-8 rounded-full transition-all ${
                                profileForm.avatarColor === color
                                  ? 'ring-2 ring-offset-2 ring-primary scale-110'
                                  : 'hover:scale-105'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Journey Stage</label>
                        <Select
                          value={profileForm.journeyStage}
                          onValueChange={(v: any) => setProfileForm({ ...profileForm, journeyStage: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="researching">🔍 Researching</SelectItem>
                            <SelectItem value="preparing">🌱 Preparing</SelectItem>
                            <SelectItem value="started">🚀 Just Started</SelectItem>
                            <SelectItem value="experienced">🧭 Experienced</SelectItem>
                            <SelectItem value="guide">🦉 Guide</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Bio (optional)</label>
                        <Textarea
                          value={profileForm.bio}
                          onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                          placeholder="Tell us about yourself..."
                          rows={3}
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={submitting}>
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Create Profile
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              ) : (
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                    style={{ backgroundColor: profile.avatarColor }}
                  >
                    {profile.avatarIcon}
                  </div>
                  <span className="text-sm font-medium">{profile.displayName}</span>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {/* Spaces Sidebar */}
              <div className="md:col-span-1">
                <div className="bg-card border border-border rounded-lg p-4">
                  <h3 className="font-headline text-lg mb-4">Spaces</h3>
                  {loadingSpaces ? (
                    <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                  ) : spaces.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center">No spaces yet</p>
                  ) : (
                    <div className="space-y-2">
                      {spaces.map((space) => (
                        <button
                          key={space.id}
                          onClick={() => {
                            setSelectedSpace(space);
                            setSelectedPost(null);
                            fetchPosts(space.id);
                            setLocation(`/community?space=${space.slug}`);
                          }}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            selectedSpace?.id === space.id
                              ? 'bg-primary/10 border border-primary'
                              : 'hover:bg-muted'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{space.icon}</span>
                            <div>
                              <p className="font-medium text-sm">{space.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {space.postCount} posts
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Main Content Area */}
              <div className="md:col-span-3">
                <AnimatePresence mode="wait">
                  {selectedPost ? (
                    // Post Detail View
                    <motion.div
                      key="post-detail"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <button
                        onClick={() => setSelectedPost(null)}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Back to posts
                      </button>

                      <div className="bg-card border border-border rounded-lg p-6">
                        {/* Post Header */}
                        <div className="flex items-start gap-4 mb-4">
                          {selectedPost.isAnonymous ? (
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                              <span className="text-xl">👤</span>
                            </div>
                          ) : selectedPost.author && (
                            <div 
                              className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                              style={{ backgroundColor: selectedPost.author.avatarColor }}
                            >
                              {selectedPost.author.avatarIcon}
                            </div>
                          )}
                          <div className="flex-1">
                            <h2 className="text-xl font-headline mb-1">{selectedPost.title}</h2>
                            <p className="text-sm text-muted-foreground">
                              {selectedPost.isAnonymous ? 'Anonymous' : selectedPost.author?.displayName} • {timeAgo(selectedPost.createdAt)}
                            </p>
                          </div>
                        </div>

                        {/* Post Content */}
                        <div className="prose prose-invert max-w-none mb-6">
                          <p className="text-foreground whitespace-pre-wrap">{selectedPost.content}</p>
                        </div>

                        {/* Post Stats */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground border-t border-border pt-4">
                          <button
                            onClick={() => handleLikePost(selectedPost.id, selectedPost.likeCount)}
                            className="flex items-center gap-1 hover:text-primary transition-colors"
                          >
                            <Heart className="w-4 h-4" />
                            {selectedPost.likeCount}
                          </button>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {selectedPost.commentCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {selectedPost.viewCount}
                          </span>
                        </div>
                      </div>

                      {/* Comments Section */}
                      <div className="mt-6">
                        <h3 className="font-headline text-lg mb-4">
                          Comments ({comments.length})
                        </h3>

                        {/* Add Comment Form */}
                        {profile ? (
                          <form onSubmit={handleSubmitComment} className="mb-6">
                            <div className="flex gap-3">
                              <div 
                                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                                style={{ backgroundColor: profile.avatarColor }}
                              >
                                {profile.avatarIcon}
                              </div>
                              <div className="flex-1">
                                <Textarea
                                  value={newComment}
                                  onChange={(e) => setNewComment(e.target.value)}
                                  placeholder="Add a comment..."
                                  rows={2}
                                  required
                                />
                                <div className="flex justify-end mt-2">
                                  <Button type="submit" size="sm" disabled={submitting || !newComment.trim()}>
                                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                    <Send className="w-4 h-4 mr-2" />
                                    Post
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </form>
                        ) : (
                          <p className="text-sm text-muted-foreground mb-4">
                            Create a profile to comment.
                          </p>
                        )}

                        {/* Comments List */}
                        {loadingComments ? (
                          <div className="flex justify-center py-8">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          </div>
                        ) : comments.length === 0 ? (
                          <p className="text-center text-muted-foreground py-8">
                            No comments yet. Be the first!
                          </p>
                        ) : (
                          <div className="space-y-4">
                            {comments.map((comment) => (
                              <motion.div
                                key={comment.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-3"
                              >
                                {comment.isAnonymous ? (
                                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                                    <span className="text-sm">👤</span>
                                  </div>
                                ) : comment.author && (
                                  <div 
                                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: comment.author.avatarColor }}
                                  >
                                    {comment.author.avatarIcon}
                                  </div>
                                )}
                                <div className="flex-1 bg-muted rounded-lg p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm">
                                      {comment.isAnonymous ? 'Anonymous' : comment.author?.displayName}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {timeAgo(comment.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ) : selectedSpace ? (
                    // Posts List View
                    <motion.div
                      key="posts-list"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{selectedSpace.icon}</span>
                          <div>
                            <h2 className="text-xl font-headline">{selectedSpace.name}</h2>
                            {selectedSpace.description && (
                              <p className="text-sm text-muted-foreground">{selectedSpace.description}</p>
                            )}
                          </div>
                        </div>
                        
                        {profile && (
                          <Dialog open={showNewPost} onOpenChange={setShowNewPost}>
                            <DialogTrigger asChild>
                              <Button size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                New Post
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Create a Post in {selectedSpace.name}</DialogTitle>
                              </DialogHeader>
                              <form onSubmit={handleCreatePost} className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">Title *</label>
                                  <Input
                                    value={newPostForm.title}
                                    onChange={(e) => setNewPostForm({ ...newPostForm, title: e.target.value })}
                                    placeholder="What's on your mind?"
                                    required
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Content *</label>
                                  <Textarea
                                    value={newPostForm.content}
                                    onChange={(e) => setNewPostForm({ ...newPostForm, content: e.target.value })}
                                    placeholder="Share your thoughts..."
                                    rows={5}
                                    required
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    id="isAnonymous"
                                    checked={newPostForm.isAnonymous}
                                    onChange={(e) => setNewPostForm({ ...newPostForm, isAnonymous: e.target.checked })}
                                  />
                                  <label htmlFor="isAnonymous" className="text-sm">Post anonymously</label>
                                </div>
                                <Button type="submit" className="w-full" disabled={submitting}>
                                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                  Create Post
                                </Button>
                              </form>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>

                      {loadingPosts ? (
                        <div className="flex justify-center py-12">
                          <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                      ) : posts.length === 0 ? (
                        <div className="text-center py-12 bg-card border border-border rounded-lg">
                          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No posts in this space yet.</p>
                          {profile && (
                            <p className="text-sm text-muted-foreground mt-2">Be the first to start a discussion!</p>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {posts.map((post) => (
                            <motion.div
                              key={post.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              onClick={() => openPost(post)}
                              className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors"
                            >
                              <div className="flex items-start gap-3">
                                {post.isAnonymous ? (
                                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                                    <span className="text-sm">👤</span>
                                  </div>
                                ) : post.author && (
                                  <div 
                                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: post.author.avatarColor }}
                                  >
                                    {post.author.avatarIcon}
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <h3 className="font-medium">{post.title}</h3>
                                      <p className="text-xs text-muted-foreground">
                                        {post.isAnonymous ? 'Anonymous' : post.author?.displayName} • {timeAgo(post.createdAt)}
                                      </p>
                                    </div>
                                    {post.isPinned && (
                                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">Pinned</span>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                    {post.content}
                                  </p>
                                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Heart className="w-3 h-3" />
                                      {post.likeCount}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <MessageSquare className="w-3 h-3" />
                                      {post.commentCount}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Eye className="w-3 h-3" />
                                      {post.viewCount}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    // No Space Selected
                    <motion.div
                      key="no-space"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12 bg-card border border-border rounded-lg"
                    >
                      <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h2 className="text-xl font-headline mb-2">Welcome to the Community</h2>
                      <p className="text-muted-foreground">
                        Select a space from the sidebar to start exploring discussions.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-border mt-auto">
        <div className="container">
          <div className="text-center text-xs text-muted-foreground font-typewriter">
            <p>© 2026 The Psychedelic Speakeasy. Community Forum.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
