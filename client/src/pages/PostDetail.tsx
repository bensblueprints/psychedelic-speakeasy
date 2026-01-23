import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Link, useParams, useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { 
  MessageCircle, 
  Heart, 
  Eye, 
  ArrowLeft,
  Clock,
  Edit,
  Trash2,
  Send
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

export default function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [commentText, setCommentText] = useState("");
  
  const { data: post, isLoading, refetch: refetchPost } = trpc.posts.byId.useQuery(
    { id: parseInt(id || "0") },
    { enabled: !!id }
  );
  
  const { data: profile } = trpc.profile.me.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  const { data: comments = [], refetch: refetchComments } = trpc.comments.byPost.useQuery(
    { postId: parseInt(id || "0") },
    { enabled: !!id }
  );
  
  const updatePost = trpc.posts.update.useMutation({
    onSuccess: () => {
      toast.success("Post updated!");
      setIsEditing(false);
      refetchPost();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const deletePost = trpc.posts.delete.useMutation({
    onSuccess: () => {
      toast.success("Post deleted!");
      navigate("/community");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const createComment = trpc.comments.create.useMutation({
    onSuccess: () => {
      toast.success("Comment added!");
      setCommentText("");
      refetchComments();
      refetchPost();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const handleStartEdit = () => {
    if (post) {
      setEditTitle(post.title || "");
      setEditContent(post.content);
      setIsEditing(true);
    }
  };
  
  const handleSaveEdit = () => {
    if (!post) return;
    updatePost.mutate({
      id: post.id,
      title: editTitle.trim() || undefined,
      content: editContent.trim(),
    });
  };
  
  const handleDelete = () => {
    if (!post) return;
    deletePost.mutate({ id: post.id });
  };
  
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    createComment.mutate({
      postId: parseInt(id || "0"),
      content: commentText.trim(),
    });
  };
  
  // Check if current user is the post author
  const isAuthor = post && profile && post.authorId === profile.id;
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }
  
  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Post not found</h2>
          <Link href="/community">
            <Button variant="outline">Back to Community</Button>
          </Link>
        </div>
      </div>
    );
  }
  
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
      
      <main className="container py-8 max-w-3xl">
        {/* Back Button */}
        <Link href="/community">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Community
          </Button>
        </Link>
        
        {/* Post Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            {/* Author Info */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                  style={{ backgroundColor: (post.author?.avatarColor || "#8B5CF6") + "30" }}
                >
                  {post.isAnonymous ? "👤" : getAvatarEmoji(post.author?.avatarIcon || "mushroom-1")}
                </div>
                <div>
                  <p className="font-medium">
                    {post.isAnonymous ? "Anonymous" : post.author?.displayName || "Unknown"}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span 
                      className="px-2 py-0.5 rounded text-xs"
                      style={{ backgroundColor: (post.space?.color || "#8B5CF6") + "20", color: post.space?.color || "#8B5CF6" }}
                    >
                      {post.space?.name || "General"}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(post.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Edit/Delete Buttons - Only show for post author */}
              {isAuthor && !isEditing && (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleStartEdit}>
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Post?</DialogTitle>
                      </DialogHeader>
                      <p className="text-muted-foreground">
                        Are you sure you want to delete this post? This action cannot be undone.
                      </p>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button 
                          variant="destructive" 
                          onClick={handleDelete}
                          disabled={deletePost.isPending}
                        >
                          {deletePost.isPending ? "Deleting..." : "Delete Post"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
            
            {/* Post Content */}
            {isEditing ? (
              <div className="space-y-4">
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Title (optional)"
                  className="text-xl font-semibold"
                />
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
                <div className="flex items-center gap-2">
                  <Button onClick={handleSaveEdit} disabled={updatePost.isPending}>
                    {updatePost.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {post.title && (
                  <h2 className="text-2xl font-semibold mb-4">{post.title}</h2>
                )}
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {post.content}
                </p>
              </>
            )}
            
            {/* Stats */}
            <div className="flex items-center gap-6 mt-6 pt-4 border-t border-border text-muted-foreground">
              <span className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                {post.likeCount || 0} likes
              </span>
              <span className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                {post.commentCount || 0} comments
              </span>
              <span className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                {post.viewCount || 0} views
              </span>
            </div>
          </CardContent>
        </Card>
        
        {/* Comments Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Comments ({comments.length})</h3>
          
          {/* Add Comment Form */}
          {isAuthenticated && profile ? (
            <form onSubmit={handleSubmitComment} className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                style={{ backgroundColor: (profile.avatarColor || "#8B5CF6") + "30" }}
              >
                {getAvatarEmoji(profile.avatarIcon || "mushroom-1")}
              </div>
              <div className="flex-1 flex gap-2">
                <Textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  rows={2}
                  className="resize-none"
                />
                <Button type="submit" size="icon" disabled={createComment.isPending || !commentText.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          ) : (
            <Card className="bg-muted/50">
              <CardContent className="p-4 text-center">
                <p className="text-muted-foreground mb-2">Join the conversation</p>
                <a href={getLoginUrl()}>
                  <Button size="sm">Sign in to comment</Button>
                </a>
              </CardContent>
            </Card>
          )}
          
          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No comments yet. Be the first to share your thoughts!
              </p>
            ) : (
              comments.map((comment: any) => (
                <Card key={comment.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                        style={{ backgroundColor: (comment.author?.avatarColor || "#8B5CF6") + "30" }}
                      >
                        {comment.isAnonymous ? "👤" : getAvatarEmoji(comment.author?.avatarIcon || "mushroom-1")}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {comment.isAnonymous ? "Anonymous" : comment.author?.displayName || "Unknown"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">{comment.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
