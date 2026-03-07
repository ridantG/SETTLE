// File: app/forum/page.tsx
// FINAL, REDESIGNED VERSION: A single, unified Client Component that handles
// the new tab-based UI for "All Posts" and "My Posts", with full functionality.

"use client";

import { createClient } from "@/lib/supabase/client";
import { type User } from "@supabase/supabase-js";
import { useEffect, useState, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";
import LoggedInHeader from "@/components/LoggedInHeader";
import EmptyState from "@/components/EmptyState";
import { useRouter } from "next/navigation";

// --- Type Definitions ---
type Reply = {
    id: number;
    content: string;
    created_at: string;
    author_id: string;
    profiles: {
        name: string | null;
        image_url: string | null;
    } | null;
};

type Post = {
    id: number;
    content: string;
    created_at: string;
    updated_at: string;
    author_id: string;
    profiles: {
        name: string | null;
        image_url: string | null;
    } | null;
    replies: Reply[];
};

type ActiveTab = "all" | "my";

// --- EXPORTS NEEDED BY forumClient.tsx ---
export type PostWithAuthor = Post;
export type ReplyWithAuthor = Reply;

// --- Reusable Sub-Components ---
const ConfirmationModal = ({
    isOpen,
    onClose,
    onConfirm,
    itemType,
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemType: string;
}) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
                <h3 className="text-lg font-bold text-gray-800">Delete {itemType}?</h3>
                <p className="mt-2 text-gray-600">This action cannot be undone.</p>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 font-semibold rounded-lg hover:bg-gray-100">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

const PostCard = ({
    post,
    currentUser,
    onAction,
}: {
    post: Post;
    currentUser: User | null;
    onAction: (action: string, id: number, content?: string) => void;
}) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex gap-4">
                <img
                    src={post.profiles?.image_url || "https://placehold.co/48x48"}
                    alt={post.profiles?.name || "User"}
                    className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                    <div className="flex justify-between items-center">
                        <p className="font-bold text-gray-800">
                            {post.profiles?.name || "Anonymous"}
                        </p>
                        {currentUser?.id === post.author_id && (
                            <div className="flex gap-4 text-sm">
                                <button
                                    onClick={() =>
                                        onAction("edit_post", post.id, post.content)
                                    }
                                    className="font-semibold text-blue-600 hover:underline"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => onAction("delete_post", post.id)}
                                    className="font-semibold text-red-600 hover:underline"
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>

                    <p className="mt-2 whitespace-pre-wrap text-gray-700">
                        {post.content}
                    </p>

                    <div className="flex gap-4 items-center mt-4 text-sm text-gray-500">
                        <span className="text-xs">
                            {new Date(post.created_at).toLocaleString()}
                        </span>
                        <button
                            onClick={() => onAction("toggle_replies", post.id)}
                            className="font-semibold hover:underline"
                        >
                            {post.replies.length} Replies
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Main Forum Page Component ---
export default function ForumPage() {
    const supabase = createClient();
    const router = useRouter();

    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<ActiveTab>("all");

    // State for creating posts
    const [newPostContent, setNewPostContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State for editing posts
    const [editingPostId, setEditingPostId] = useState<number | null>(null);
    const [editContent, setEditContent] = useState("");

    // State for delete confirmation
    const [deletePostId, setDeletePostId] = useState<number | null>(null);

    const fetchPosts = useCallback(async () => {
        setLoading(true);

        let query = supabase
            .from("posts")
            .select(
                `*, profiles:author_id(*), replies(*, profiles:author_id(*))`
            )
            .order("created_at", { ascending: false });

        if (activeTab === "my" && currentUser) {
            query = query.eq("author_id", currentUser.id);
        }

        const { data, error } = await query;

        if (error) {
            toast.error("Could not load posts.");
        } else {
            setPosts((data as Post[]) || []);
        }

        setLoading(false);
    }, [supabase, activeTab, currentUser]);

    useEffect(() => {
        const getUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (user) {
                setCurrentUser(user);
            } else {
                router.push("/login");
            }
        };

        getUser();
    }, [supabase, router]);

    useEffect(() => {
        if (currentUser) {
            fetchPosts();
        }
    }, [currentUser, activeTab, fetchPosts]);

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPostContent.trim() === "") return;

        setIsSubmitting(true);

        const response = await fetch("/api/forum/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: newPostContent }),
        });

        if (response.ok) {
            toast.success("Post created!");
            setNewPostContent("");
            fetchPosts();
        } else {
            toast.error("Failed to create post.");
        }

        setIsSubmitting(false);
    };

    const handlePostAction = async (action: string, id: number, content?: string) => {
        if (action === "edit_post") {
            setEditingPostId(id);
            setEditContent(content || "");
        }
        if (action === "delete_post") {
            setDeletePostId(id);
        }
    };

    const handleEditSubmit = async (postId: number) => {
        if (editContent.trim() === "") return;
        setIsSubmitting(true);
        const response = await fetch(`/api/forum/posts/${postId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: editContent }),
        });
        if (response.ok) {
            toast.success("Post updated!");
            setEditingPostId(null);
            setEditContent("");
            fetchPosts();
        } else {
            toast.error("Failed to update post.");
        }
        setIsSubmitting(false);
    };

    const handleDeleteConfirm = async () => {
        if (!deletePostId) return;
        const response = await fetch(`/api/forum/posts/${deletePostId}`, {
            method: "DELETE",
        });
        if (response.ok) {
            toast.success("Post deleted!");
            setDeletePostId(null);
            fetchPosts();
        } else {
            toast.error("Failed to delete post.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Toaster position="top-center" />
            <LoggedInHeader />

            <main className="max-w-4xl mx-auto py-12 px-4">
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-extrabold text-gray-900">
                        Community Forum
                    </h1>
                    <p className="mt-4 text-lg text-gray-600">
                        Connect with the Settle community, ask questions, and share
                        experiences.
                    </p>
                </div>

                {/* Create Post */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                    <form onSubmit={handleCreatePost}>
                        <textarea
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            className="w-full p-3 bg-gray-50 rounded-lg border border-gray-300"
                            placeholder="Share your thoughts..."
                            rows={3}
                            disabled={isSubmitting}
                        />
                        <div className="flex justify-end mt-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-2 bg-green-500 text-white font-semibold rounded-lg disabled:bg-gray-400"
                            >
                                {isSubmitting ? "Posting..." : "Post"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Tabs */}
                <div className="mb-8 border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab("all")}
                            className={`${
                                activeTab === "all"
                                    ? "border-green-500 text-green-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg`}
                        >
                            All Posts
                        </button>

                        <button
                            onClick={() => setActiveTab("my")}
                            className={`${
                                activeTab === "my"
                                    ? "border-green-500 text-green-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg`}
                        >
                            My Posts
                        </button>
                    </nav>
                </div>

                {/* Posts List */}
                <div className="space-y-6">
                    {loading ? (
                        <p>Loading posts...</p>
                    ) : posts.length > 0 ? (
                        posts.map((post) => (
                            <div key={post.id}>
                                {editingPostId === post.id ? (
                                    <div className="bg-white p-6 rounded-lg shadow-md">
                                        <textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            className="w-full p-3 bg-gray-50 rounded-lg border border-gray-300"
                                            rows={3}
                                            disabled={isSubmitting}
                                        />
                                        <div className="flex justify-end gap-3 mt-4">
                                            <button
                                                onClick={() => { setEditingPostId(null); setEditContent(""); }}
                                                className="px-4 py-2 text-gray-600 font-semibold rounded-lg hover:bg-gray-100"
                                                disabled={isSubmitting}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => handleEditSubmit(post.id)}
                                                disabled={isSubmitting}
                                                className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
                                            >
                                                {isSubmitting ? "Saving..." : "Save"}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <PostCard
                                        post={post}
                                        currentUser={currentUser}
                                        onAction={handlePostAction}
                                    />
                                )}
                            </div>
                        ))
                    ) : (
                        <EmptyState
                            title={
                                activeTab === "all"
                                    ? "The Forum is Quiet"
                                    : "You Haven't Posted Yet"
                            }
                            message={
                                activeTab === "all"
                                    ? "Be the first to start a conversation!"
                                    : "Share your thoughts with the community to get started."
                            }
                        />
                    )}
                </div>

                {/* Delete Confirmation Modal */}
                <ConfirmationModal
                    isOpen={deletePostId !== null}
                    onClose={() => setDeletePostId(null)}
                    onConfirm={handleDeleteConfirm}
                    itemType="Post"
                />
            </main>
        </div>
    );
}
