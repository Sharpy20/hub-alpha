"use client";

import { useState, useEffect, useCallback } from "react";
import { MainLayout } from "@/components/layout";
import { useApp } from "@/app/providers";
import {
  supabase,
  FeedbackPost,
  FeedbackComment,
  FEEDBACK_CATEGORIES,
  FEEDBACK_SUB_CATEGORIES,
  FeedbackCategory,
} from "@/lib/supabase";
import {
  MessageSquare,
  ThumbsUp,
  Plus,
  X,
  Send,
  ChevronDown,
  ChevronUp,
  Clock,
  TrendingUp,
  Filter,
  MessageCircle,
  User,
} from "lucide-react";

// Generate a simple user ID stored in localStorage
function getUserId(): string {
  if (typeof window === "undefined") return "anonymous";
  let userId = localStorage.getItem("feedback_user_id");
  if (!userId) {
    userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem("feedback_user_id", userId);
  }
  return userId;
}

// Get/set username from localStorage
function getUsername(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("feedback_username") || "";
}

function setUsername(name: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("feedback_username", name);
  }
}

// Time ago formatter
function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// Get sub-category label
function getSubCategoryLabel(categoryId: string, subCategoryId: string | null): string | null {
  if (!subCategoryId) return null;
  const subCategories = FEEDBACK_SUB_CATEGORIES[categoryId];
  if (!subCategories) return null;
  const sub = subCategories.find((s) => s.id === subCategoryId);
  return sub?.label || null;
}

// Category badge component
function CategoryBadge({ categoryId, subCategoryId }: { categoryId: string; subCategoryId?: string | null }) {
  const category = FEEDBACK_CATEGORIES.find((c) => c.id === categoryId);
  if (!category) return null;

  const subCategoryLabel = subCategoryId ? getSubCategoryLabel(categoryId, subCategoryId) : null;

  const colorClasses: Record<string, string> = {
    indigo: "bg-indigo-100 text-indigo-700",
    emerald: "bg-emerald-100 text-emerald-700",
    purple: "bg-purple-100 text-purple-700",
    blue: "bg-blue-100 text-blue-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
    gray: "bg-gray-100 text-gray-700",
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colorClasses[category.color]}`}>
      <span>{category.icon}</span>
      {subCategoryLabel && !subCategoryLabel.startsWith('General')
        ? subCategoryLabel
        : category.label}
    </span>
  );
}

// Username input modal
function UsernameModal({
  isOpen,
  onClose,
  onSubmit,
  initialName,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  initialName: string;
}) {
  const [name, setName] = useState(initialName);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Set Your Display Name</h2>
        <p className="text-gray-500 text-sm mb-4">This is how others will see you in discussions.</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter a display name..."
          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none mb-4"
          autoFocus
        />
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 p-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (name.trim()) {
                onSubmit(name.trim());
              }
            }}
            disabled={!name.trim()}
            className="flex-1 p-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// New post modal
function NewPostModal({
  isOpen,
  onClose,
  onSubmit,
  username,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, content: string, category: FeedbackCategory, subCategory: string | null) => void;
  username: string;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<FeedbackCategory>("general");
  const [subCategory, setSubCategory] = useState<string | null>(null);

  // Get sub-categories for the selected category
  const subCategories = FEEDBACK_SUB_CATEGORIES[category] || [];
  const hasSubCategories = subCategories.length > 0;

  if (!isOpen) return null;

  const handleCategoryChange = (newCategory: FeedbackCategory) => {
    setCategory(newCategory);
    // Reset sub-category when main category changes
    const newSubCategories = FEEDBACK_SUB_CATEGORIES[newCategory] || [];
    if (newSubCategories.length > 0) {
      setSubCategory(newSubCategories[0].id); // Default to first option (General)
    } else {
      setSubCategory(null);
    }
  };

  const handleSubmit = () => {
    if (title.trim() && content.trim()) {
      onSubmit(title.trim(), content.trim(), category, hasSubCategories ? subCategory : null);
      setTitle("");
      setContent("");
      setCategory("general");
      setSubCategory(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Start a Discussion</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <div className="grid grid-cols-2 gap-2">
            {FEEDBACK_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`p-2 rounded-lg text-left text-sm flex items-center gap-2 transition-all ${
                  category === cat.id
                    ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-400"
                    : "bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100"
                }`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sub-category dropdown - only show if category has sub-categories */}
        {hasSubCategories && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specific {FEEDBACK_CATEGORIES.find(c => c.id === category)?.label.replace(' Workflows', '').replace(' Guides', '')}
            </label>
            <select
              value={subCategory || ''}
              onChange={(e) => setSubCategory(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none bg-white"
            >
              {subCategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Select a specific item or choose &quot;General&quot; for overall feedback
            </p>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's your topic?"
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts, ideas, or questions..."
            rows={4}
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none resize-none"
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Posting as <span className="font-medium text-gray-700">{username}</span>
          </p>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Post
          </button>
        </div>
      </div>
    </div>
  );
}

// Single post card with comments
function PostCard({
  post,
  comments,
  userVotes,
  onVote,
  onComment,
  username,
  userId,
}: {
  post: FeedbackPost;
  comments: FeedbackComment[];
  userVotes: Set<string>;
  onVote: (postId: string) => void;
  onComment: (postId: string, content: string) => void;
  username: string;
  userId: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplyInput, setShowReplyInput] = useState(false);

  const postComments = comments.filter((c) => c.post_id === post.id);
  const hasVoted = userVotes.has(`post-${post.id}`);

  const handleSubmitReply = () => {
    if (replyText.trim()) {
      onComment(post.id, replyText.trim());
      setReplyText("");
      setShowReplyInput(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Vote button */}
          <button
            onClick={() => onVote(post.id)}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              hasVoted
                ? "bg-indigo-100 text-indigo-600"
                : "bg-gray-50 text-gray-500 hover:bg-gray-100"
            }`}
          >
            <ThumbsUp className={`w-5 h-5 ${hasVoted ? "fill-current" : ""}`} />
            <span className="text-sm font-bold">{post.upvotes}</span>
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <CategoryBadge categoryId={post.category} subCategoryId={post.sub_category} />
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500">{timeAgo(post.created_at)}</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-1">{post.title}</h3>
            <p className="text-gray-600 text-sm">{post.content}</p>

            {/* Author and actions */}
            <div className="flex items-center gap-4 mt-3">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <User className="w-3 h-3" />
                {post.author_name}
              </span>
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <MessageCircle className="w-3 h-3" />
                {postComments.length} {postComments.length === 1 ? "reply" : "replies"}
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              <button
                onClick={() => {
                  setExpanded(true);
                  setShowReplyInput(true);
                }}
                className="text-xs text-gray-500 hover:text-indigo-600"
              >
                Reply
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments section */}
      {expanded && (
        <div className="border-t border-gray-100 bg-gray-50 p-4">
          {/* Comments list */}
          {postComments.length > 0 && (
            <div className="space-y-3 mb-4">
              {postComments.map((comment) => (
                <div key={comment.id} className="bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-sm text-gray-700">{comment.content}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {comment.author_name}
                    </span>
                    <span className="text-xs text-gray-400">{timeAgo(comment.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reply input */}
          {showReplyInput ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 p-2 border border-gray-200 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitReply();
                  }
                }}
              />
              <button
                onClick={handleSubmitReply}
                disabled={!replyText.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowReplyInput(true)}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              + Add a reply
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Main feedback page
export default function FeedbackPage() {
  const { user } = useApp();
  const [posts, setPosts] = useState<FeedbackPost[]>([]);
  const [comments, setComments] = useState<FeedbackComment[]>([]);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [username, setUsernameState] = useState("");
  const [userId, setUserIdState] = useState("");
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showNewPostModal, setShowNewPostModal] = useState(false);

  const [sortBy, setSortBy] = useState<"popular" | "newest">("popular");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Initialize user
  useEffect(() => {
    const id = getUserId();
    setUserIdState(id);

    // Try to get username from localStorage, or use logged-in user's name
    let name = getUsername();
    if (!name && user?.name) {
      name = user.name;
      setUsername(name);
    }
    setUsernameState(name);
  }, [user]);

  // Fetch posts and comments
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch posts
      const { data: postsData, error: postsError } = await supabase
        .from("feedback_posts")
        .select("*")
        .order(sortBy === "popular" ? "upvotes" : "created_at", { ascending: false });

      if (postsError) throw postsError;

      // Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from("feedback_comments")
        .select("*")
        .order("created_at", { ascending: true });

      if (commentsError) throw commentsError;

      // Fetch user's votes
      const { data: votesData, error: votesError } = await supabase
        .from("feedback_votes")
        .select("*")
        .eq("user_id", userId);

      if (votesError) throw votesError;

      setPosts(postsData || []);
      setComments(commentsData || []);

      // Build set of voted items
      const votes = new Set<string>();
      votesData?.forEach((vote) => {
        if (vote.post_id) votes.add(`post-${vote.post_id}`);
        if (vote.comment_id) votes.add(`comment-${vote.comment_id}`);
      });
      setUserVotes(votes);
    } catch (err) {
      console.error("Error fetching feedback:", err);
      setError("Failed to load discussions. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [sortBy, userId]);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId, fetchData]);

  // Handle creating a new post
  const handleCreatePost = async (title: string, content: string, category: FeedbackCategory, subCategory: string | null) => {
    try {
      const { error } = await supabase.from("feedback_posts").insert({
        title,
        content,
        category,
        sub_category: subCategory,
        author_name: username,
        author_id: userId,
        upvotes: 0,
      });

      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error("Error creating post:", err);
      alert("Failed to create post. Please try again.");
    }
  };

  // Handle voting on a post
  const handleVote = async (postId: string) => {
    const voteKey = `post-${postId}`;
    const hasVoted = userVotes.has(voteKey);

    try {
      if (hasVoted) {
        // Remove vote
        await supabase
          .from("feedback_votes")
          .delete()
          .eq("user_id", userId)
          .eq("post_id", postId);

        // Decrement upvotes
        const post = posts.find((p) => p.id === postId);
        if (post) {
          await supabase
            .from("feedback_posts")
            .update({ upvotes: Math.max(0, post.upvotes - 1) })
            .eq("id", postId);
        }

        setUserVotes((prev) => {
          const next = new Set(prev);
          next.delete(voteKey);
          return next;
        });
      } else {
        // Add vote
        await supabase.from("feedback_votes").insert({
          user_id: userId,
          post_id: postId,
        });

        // Increment upvotes
        const post = posts.find((p) => p.id === postId);
        if (post) {
          await supabase
            .from("feedback_posts")
            .update({ upvotes: post.upvotes + 1 })
            .eq("id", postId);
        }

        setUserVotes((prev) => new Set(prev).add(voteKey));
      }

      fetchData();
    } catch (err) {
      console.error("Error voting:", err);
    }
  };

  // Handle adding a comment
  const handleComment = async (postId: string, content: string) => {
    try {
      const { error } = await supabase.from("feedback_comments").insert({
        post_id: postId,
        content,
        author_name: username,
        author_id: userId,
        upvotes: 0,
      });

      if (error) throw error;
      fetchData();
    } catch (err) {
      console.error("Error adding comment:", err);
      alert("Failed to add reply. Please try again.");
    }
  };

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    if (filterCategory === "all") return true;
    return post.category === filterCategory;
  });

  // Check if user needs to set username
  const needsUsername = !username;

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <MessageSquare className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Community Feedback</h1>
              <p className="text-white/80">Share ideas, report issues, and collaborate</p>
            </div>
          </div>
        </div>

        {/* User info bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              {username ? (
                <>
                  <p className="font-medium text-gray-900">{username}</p>
                  <button
                    onClick={() => setShowUsernameModal(true)}
                    className="text-xs text-indigo-600 hover:text-indigo-800"
                  >
                    Change name
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowUsernameModal(true)}
                  className="text-indigo-600 font-medium hover:text-indigo-800"
                >
                  Set your display name to join
                </button>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              if (needsUsername) {
                setShowUsernameModal(true);
              } else {
                setShowNewPostModal(true);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5" />
            New Discussion
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSortBy("popular")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                sortBy === "popular"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Popular
            </button>
            <button
              onClick={() => setSortBy("newest")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                sortBy === "newest"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Clock className="w-4 h-4" />
              Newest
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Categories</option>
              {FEEDBACK_CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>

          <span className="text-sm text-gray-500 ml-auto">
            {filteredPosts.length} {filteredPosts.length === 1 ? "discussion" : "discussions"}
          </span>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
            {error}
            <button
              onClick={fetchData}
              className="ml-2 text-red-800 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-gray-500 mt-3">Loading discussions...</p>
          </div>
        )}

        {/* Posts list */}
        {!loading && !error && (
          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <p className="text-4xl mb-3">💬</p>
                <p className="text-gray-600 font-medium">No discussions yet</p>
                <p className="text-gray-400 text-sm mt-1">Be the first to start a conversation!</p>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  comments={comments}
                  userVotes={userVotes}
                  onVote={handleVote}
                  onComment={handleComment}
                  username={username}
                  userId={userId}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <UsernameModal
        isOpen={showUsernameModal}
        onClose={() => setShowUsernameModal(false)}
        initialName={username || user?.name || ""}
        onSubmit={(name) => {
          setUsername(name);
          setUsernameState(name);
          setShowUsernameModal(false);
        }}
      />

      <NewPostModal
        isOpen={showNewPostModal}
        onClose={() => setShowNewPostModal(false)}
        onSubmit={handleCreatePost}
        username={username}
      />
    </MainLayout>
  );
}
