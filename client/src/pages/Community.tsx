import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import { 
  MessageCircle, 
  Heart, 
  Eye, 
  Users, 
  Sparkles,
  Flame,
  Moon,
  Sun,
  HelpCircle,
  HandMetal,
  Plus,
  ChevronRight,
  Clock
} from "lucide-react";

// Anonymous avatar icons
const AVATAR_ICONS = [
  { id: "mushroom-1", emoji: "🍄" },
  { id: "mushroom-2", emoji: "🌿" },
  { id: "mushroom-3", emoji: "🌙" },
  { id: "mushroom-4", emoji: "✨" },
  { id: "mushroom-5", emoji: "🔮" },
  { id: "mushroom-6", emoji: "🌸" },
  { id: "mushroom-7", emoji: "🦋" },
  { id: "mushroom-8", emoji: "🌊" },
  { id: "mushroom-9", emoji: "🔥" },
  { id: "mushroom-10", emoji: "💫" },
  { id: "mushroom-11", emoji: "🌺" },
  { id: "mushroom-12", emoji: "🍃" },
];

const AVATAR_COLORS = [
  "#8B5CF6", "#EF4444", "#10B981", "#3B82F6", "#F59E0B", 
  "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1"
];

const JOIN_REASONS = [
  { id: "ptsd", label: "PTSD / Trauma Healing" },
  { id: "depression", label: "Depression / Anxiety" },
  { id: "addiction", label: "Addiction Recovery" },
  { id: "medication", label: "Getting Off Medication" },
  { id: "spiritual", label: "Spiritual Growth" },
  { id: "creativity", label: "Creativity & Performance" },
  { id: "curiosity", label: "General Curiosity" },
  { id: "research", label: "Research & Education" },
];

const SPACE_ICONS: Record<string, React.ReactNode> = {
  "hand-wave": <HandMetal className="w-5 h-5" />,
  "sparkles": <Sparkles className="w-5 h-5" />,
  "flame": <Flame className="w-5 h-5" />,
  "moon": <Moon className="w-5 h-5" />,
  "heart": <Heart className="w-5 h-5" />,
  "sun": <Sun className="w-5 h-5" />,
  "help-circle": <HelpCircle className="w-5 h-5" />,
  "message-circle": <MessageCircle className="w-5 h-5" />,
};

function getAvatarEmoji(iconId: string) {
  return AVATAR_ICONS.find(a => a.id === iconId)?.emoji || "🍄";
}

function formatTimeAgo(date: Date | string) {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return then.toLocaleDateString();
}

// Profile Creation Modal
function CreateProfileModal({ onSuccess }: { onSuccess: () => void }) {
  const [displayName, setDisplayName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("mushroom-1");
  const [selectedColor, setSelectedColor] = useState("#8B5CF6");
  const [bio, setBio] = useState("");
  const [journeyStage, setJourneyStage] = useState<string>("researching");
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  
  const createProfile = trpc.profile.create.useMutation({
    onSuccess: () => {
      toast.success("Profile created! Welcome to the community.");
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error("Please enter a display name");
      return;
    }
    
    createProfile.mutate({
      displayName: displayName.trim(),
      avatarIcon: selectedIcon,
      avatarColor: selectedColor,
      bio: bio.trim() || undefined,
      journeyStage: journeyStage as any,
      joinReasons: selectedReasons.length > 0 ? selectedReasons : undefined,
      isPublic,
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Display Name (Anonymous)</label>
        <Input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="e.g., MysticSeeker, HealingJourney"
          className="bg-background"
          maxLength={50}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Choose an anonymous name. Your real identity stays private.
        </p>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Choose Your Avatar</label>
        <div className="grid grid-cols-6 gap-2 mb-3">
          {AVATAR_ICONS.map((icon) => (
            <button
              key={icon.id}
              type="button"
              onClick={() => setSelectedIcon(icon.id)}
              className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-all ${
                selectedIcon === icon.id 
                  ? "ring-2 ring-primary scale-110" 
                  : "hover:bg-muted"
              }`}
              style={{ backgroundColor: selectedIcon === icon.id ? selectedColor + "30" : undefined }}
            >
              {icon.emoji}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {AVATAR_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setSelectedColor(color)}
              className={`w-8 h-8 rounded-full transition-all ${
                selectedColor === color ? "ring-2 ring-offset-2 ring-primary scale-110" : ""
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Where are you in your journey?</label>
        <Select value={journeyStage} onValueChange={setJourneyStage}>
          <SelectTrigger className="bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="researching">🔍 Just Researching</SelectItem>
            <SelectItem value="preparing">🌱 Preparing to Start</SelectItem>
            <SelectItem value="started">🚀 Recently Started</SelectItem>
            <SelectItem value="experienced">⭐ Experienced</SelectItem>
            <SelectItem value="guide">🧭 Guide / Mentor</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Why did you join? (Select all that apply)</label>
        <div className="grid grid-cols-2 gap-2">
          {JOIN_REASONS.map((reason) => (
            <label
              key={reason.id}
              className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                selectedReasons.includes(reason.id) 
                  ? "border-primary bg-primary/10" 
                  : "border-border hover:border-muted-foreground"
              }`}
            >
              <Checkbox
                checked={selectedReasons.includes(reason.id)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedReasons([...selectedReasons, reason.id]);
                  } else {
                    setSelectedReasons(selectedReasons.filter(r => r !== reason.id));
                  }
                }}
              />
              <span className="text-sm">{reason.label}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Bio (Optional)</label>
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Share a bit about yourself and your healing journey..."
          className="bg-background"
          rows={3}
          maxLength={500}
        />
      </div>
      
      <div className="flex items-center gap-2">
        <Checkbox
          id="isPublic"
          checked={isPublic}
          onCheckedChange={(checked) => setIsPublic(!!checked)}
        />
        <label htmlFor="isPublic" className="text-sm">
          Make my profile visible to other members
        </label>
      </div>
      
      <Button type="submit" className="w-full" disabled={createProfile.isPending}>
        {createProfile.isPending ? "Creating..." : "Create My Profile"}
      </Button>
    </form>
  );
}

// Post Card Component
function PostCard({ post }: { post: any }) {
  return (
    <Link href={`/community/post/${post.id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Author Avatar */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
              style={{ backgroundColor: (post.author?.avatarColor || "#8B5CF6") + "30" }}
            >
              {post.isAnonymous ? "👤" : getAvatarEmoji(post.author?.avatarIcon || "mushroom-1")}
            </div>
            
            <div className="flex-1 min-w-0">
              {/* Author & Space Info */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                <span className="font-medium text-foreground">
                  {post.isAnonymous ? "Anonymous" : post.author?.displayName || "Unknown"}
                </span>
                <span>•</span>
                <span 
                  className="px-2 py-0.5 rounded text-xs"
                  style={{ backgroundColor: (post.space?.color || "#8B5CF6") + "20", color: post.space?.color }}
                >
                  {post.space?.name || "General"}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTimeAgo(post.createdAt)}
                </span>
              </div>
              
              {/* Title */}
              {post.title && (
                <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
                  {post.title}
                </h3>
              )}
              
              {/* Content Preview */}
              <p className="text-muted-foreground text-sm line-clamp-2">
                {post.content}
              </p>
              
              {/* Stats */}
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {post.likeCount || 0}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {post.commentCount || 0}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {post.viewCount || 0}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

// Create Post Modal
function CreatePostModal({ spaces, onSuccess }: { spaces: any[]; onSuccess: () => void }) {
  const [spaceId, setSpaceId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  const createPost = trpc.posts.create.useMutation({
    onSuccess: () => {
      toast.success("Post created!");
      setTitle("");
      setContent("");
      setIsAnonymous(false);
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spaceId) {
      toast.error("Please select a space");
      return;
    }
    if (!content.trim()) {
      toast.error("Please enter some content");
      return;
    }
    
    createPost.mutate({
      spaceId: parseInt(spaceId),
      title: title.trim() || undefined,
      content: content.trim(),
      isAnonymous,
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Space</label>
        <Select value={spaceId} onValueChange={setSpaceId}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="Select a space..." />
          </SelectTrigger>
          <SelectContent>
            {spaces.map((space) => (
              <SelectItem key={space.id} value={space.id.toString()}>
                <span className="flex items-center gap-2">
                  {SPACE_ICONS[space.icon] || <MessageCircle className="w-4 h-4" />}
                  {space.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Title (Optional)</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your post a title..."
          className="bg-background"
          maxLength={300}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">What's on your mind?</label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts, experiences, or questions..."
          className="bg-background"
          rows={5}
        />
      </div>
      
      <div className="flex items-center gap-2">
        <Checkbox
          id="isAnonymous"
          checked={isAnonymous}
          onCheckedChange={(checked) => setIsAnonymous(!!checked)}
        />
        <label htmlFor="isAnonymous" className="text-sm">
          Post anonymously (your profile won't be shown)
        </label>
      </div>
      
      <Button type="submit" className="w-full" disabled={createPost.isPending}>
        {createPost.isPending ? "Posting..." : "Share Post"}
      </Button>
    </form>
  );
}

export default function Community() {
  const { user, isAuthenticated } = useAuth();
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  
  const { data: profile, refetch: refetchProfile } = trpc.profile.me.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  const { data: spaces = [] } = trpc.spaces.list.useQuery();
  const { data: posts = [], refetch: refetchPosts } = trpc.posts.recent.useQuery({ limit: 20 });
  const { data: memberCount = 0 } = trpc.profile.count.useQuery();
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border py-4">
        <div className="container">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h1 className="text-2xl font-headline text-foreground hover:text-primary transition-colors">
                THE PSYCHEDELIC SPEAKEASY
              </h1>
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/articles" className="text-sm text-muted-foreground hover:text-foreground">
                Articles
              </Link>
              <Link href="/community" className="text-sm text-primary font-medium">
                Community
              </Link>
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">Dashboard</Button>
                </Link>
              ) : (
                <a href={getLoginUrl()}>
                  <Button size="sm">Join Now</Button>
                </a>
              )}
            </nav>
          </div>
        </div>
      </header>
      
      <main className="container py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Member Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Community
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-primary">{memberCount.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">members on their healing journey</p>
              </CardContent>
            </Card>
            
            {/* Profile Card or Create Profile */}
            {isAuthenticated && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Your Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  {profile ? (
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                        style={{ backgroundColor: (profile.avatarColor || "#8B5CF6") + "30" }}
                      >
                        {getAvatarEmoji(profile.avatarIcon || "mushroom-1")}
                      </div>
                      <div>
                        <p className="font-medium">{profile.displayName}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {profile.journeyStage?.replace("-", " ")}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Dialog open={showCreateProfile} onOpenChange={setShowCreateProfile}>
                      <DialogTrigger asChild>
                        <Button className="w-full">Create Your Profile</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Create Your Anonymous Profile</DialogTitle>
                        </DialogHeader>
                        <CreateProfileModal onSuccess={() => {
                          setShowCreateProfile(false);
                          refetchProfile();
                        }} />
                      </DialogContent>
                    </Dialog>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Spaces */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Spaces</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {spaces.map((space: any) => (
                  <Link key={space.id} href={`/community/space/${space.slug}`}>
                    <div className="flex items-center justify-between p-2 rounded hover:bg-muted transition-colors cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span style={{ color: space.color }}>
                          {SPACE_ICONS[space.icon] || <MessageCircle className="w-4 h-4" />}
                        </span>
                        <span className="text-sm">{space.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{space.postCount || 0}</span>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </aside>
          
          {/* Main Feed */}
          <div className="lg:col-span-3 space-y-6">
            {/* Create Post Button */}
            {isAuthenticated && profile && (
              <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
                <DialogTrigger asChild>
                  <Card className="cursor-pointer hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                          style={{ backgroundColor: (profile.avatarColor || "#8B5CF6") + "30" }}
                        >
                          {getAvatarEmoji(profile.avatarIcon || "mushroom-1")}
                        </div>
                        <div className="flex-1 bg-muted rounded-full px-4 py-2 text-muted-foreground text-sm">
                          Share your thoughts or experiences...
                        </div>
                        <Button size="sm">
                          <Plus className="w-4 h-4 mr-1" />
                          Post
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create a Post</DialogTitle>
                  </DialogHeader>
                  <CreatePostModal 
                    spaces={spaces} 
                    onSuccess={() => {
                      setShowCreatePost(false);
                      refetchPosts();
                    }} 
                  />
                </DialogContent>
              </Dialog>
            )}
            
            {/* Not logged in prompt */}
            {!isAuthenticated && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6 text-center">
                  <h3 className="text-lg font-semibold mb-2">Join the Conversation</h3>
                  <p className="text-muted-foreground mb-4">
                    Create a free account to share your experiences and connect with others on their healing journey.
                  </p>
                  <a href={getLoginUrl()}>
                    <Button>
                      Join the Community
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </a>
                </CardContent>
              </Card>
            )}
            
            {/* Posts Feed */}
            <div className="space-y-4">
              <h2 className="text-xl font-headline">Recent Discussions</h2>
              
              {posts.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                    <p className="text-muted-foreground">
                      Be the first to share your experience with the community!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                posts.map((post: any) => (
                  <PostCard key={post.id} post={post} />
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
