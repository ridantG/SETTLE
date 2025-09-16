// File: app/forum/ForumClient.tsx
// FINAL, CORRECTED, AND COMPLETE VERSION
// This version uses the new, safe Timestamp component to prevent hydration errors.

"use client";

import { useState } from 'react';
import { type PostWithAuthor, type ReplyWithAuthor } from './page';
import EmptyState from '@/components/EmptyState';
import toast, { Toaster } from 'react-hot-toast';
import { type User } from '@supabase/supabase-js';
import Timestamp from '@/components/Timestamp'; // <-- IMPORT THE NEW, SAFE COMPONENT

const ConfirmationModal = ({ isOpen, onClose, onConfirm, itemType }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, itemType: string }) => {
    if (!isOpen) return null;
    return <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"><div className="bg-white rounded-lg shadow-xl p-8 max-w-sm w-full"><h2 className="text-2xl font-bold">Are you sure?</h2><p className="text-gray-600 mt-4">This {itemType} will be permanently deleted.</p><div className="flex justify-end gap-4 mt-8"><button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button><button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg">Yes, Delete</button></div></div></div>;
};

export default function ForumClient({ initialPosts, currentUser }: { initialPosts: PostWithAuthor[], currentUser: User | null }) {
    const [posts, setPosts] = useState(initialPosts);
    const [newPostContent, setNewPostContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [visibleReplies, setVisibleReplies] = useState<{ [key: number]: boolean }>({});
    const [replyContent, setReplyContent] = useState<{ [key: number]: string }>({});
    const [editingPost, setEditingPost] = useState<PostWithAuthor | null>(null);
    const [deletingPostId, setDeletingPostId] = useState<number | null>(null);
    const [editingReply, setEditingReply] = useState<ReplyWithAuthor | null>(null);
    const [deletingReplyId, setDeletingReplyId] = useState<number | null>(null);

    const reloadPage = () => window.location.reload();

    const handleApiCall = async (endpoint: string, method: string, body: any, successMessage: string) => {
        setIsSubmitting(true);
        const toastId = toast.loading("Processing...");
        const response = await fetch(endpoint, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        toast.dismiss(toastId);
        setIsSubmitting(false);
        if (response.ok) {
            toast.success(successMessage);
            return true;
        } else {
            toast.error("An error occurred. Please try again.");
            return false;
        }
    };

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPostContent.trim() === '') return;
        if (await handleApiCall('/api/forum/posts', 'POST', { content: newPostContent }, 'Post created!')) {
            reloadPage();
        }
    };

    const handleCreateReply = async (postId: number) => {
        const content = replyContent[postId];
        if (!content || content.trim() === '') return;
        if (await handleApiCall(`/api/forum/posts/${postId}/replies`, 'POST', { content }, 'Reply posted!')) {
            reloadPage();
        }
    };

    const handleSaveEditPost = async () => {
        if (!editingPost) return;
        if (await handleApiCall(`/api/forum/posts/${editingPost.id}`, 'PATCH', { content: editingPost.content }, 'Post updated!')) {
            setPosts(posts.map(p => p.id === editingPost.id ? { ...p, content: editingPost.content, updated_at: new Date().toISOString() } : p));
            setEditingPost(null);
        }
    };

    const handleDeletePost = async () => {
        if (!deletingPostId) return;
        if (await handleApiCall(`/api/forum/posts/${deletingPostId}`, 'DELETE', {}, 'Post deleted.')) {
            setPosts(posts.filter(p => p.id !== deletingPostId));
            setDeletingPostId(null);
        }
    };

    const handleSaveEditReply = async () => {
        if (!editingReply) return;
        if (await handleApiCall(`/api/forum/replies/${editingReply.id}`, 'PATCH', { content: editingReply.content }, 'Reply updated!')) {
            setPosts(posts.map(p => ({ ...p, replies: p.replies.map(r => r.id === editingReply.id ? { ...r, content: editingReply.content, updated_at: new Date().toISOString() } : r) })));
            setEditingReply(null);
        }
    };
    
    const handleDeleteReply = async () => {
        if (!deletingReplyId) return;
        if (await handleApiCall(`/api/forum/replies/${deletingReplyId}`, 'DELETE', {}, 'Reply deleted.')) {
            setPosts(posts.map(p => ({ ...p, replies: p.replies.filter(r => r.id !== deletingReplyId) })));
            setDeletingReplyId(null);
        }
    };

    return (
        <div>
            <Toaster position="top-center" />
            <ConfirmationModal isOpen={deletingPostId !== null} onClose={() => setDeletingPostId(null)} onConfirm={handleDeletePost} itemType="post" />
            <ConfirmationModal isOpen={deletingReplyId !== null} onClose={() => setDeletingReplyId(null)} onConfirm={handleDeleteReply} itemType="reply" />

            <div className="bg-white p-6 rounded-lg shadow-md mb-8"><form onSubmit={handleCreatePost}><textarea value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} className="w-full p-3 bg-gray-50 rounded-lg border" placeholder="Share your thoughts..." rows={3} disabled={isSubmitting} /><div className="flex justify-end mt-4"><button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-green-500 text-white font-semibold rounded-lg">Post</button></div></form></div>

            <div className="space-y-6">
                {posts.length > 0 ? posts.map(post => (
                    <div key={post.id} className="bg-white p-6 rounded-lg shadow-md">
                        {editingPost?.id === post.id ? (
                            <div className="space-y-2"><textarea value={editingPost.content} onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })} className="w-full p-2 border rounded" rows={3}/> <div className="flex justify-end gap-2 mt-2"><button onClick={() => setEditingPost(null)} className="text-sm">Cancel</button><button onClick={handleSaveEditPost} className="text-sm font-semibold text-green-600">Save</button></div></div>
                        ) : (
                            <div className="flex gap-4">
                                <img src={post.profiles?.image_url || 'https://placehold.co/48x48'} alt={post.profiles?.name || 'User'} className="w-12 h-12 rounded-full object-cover" />
                                <div className="flex-1">
                                    <div className="flex justify-between items-center"><p className="font-bold">{post.profiles?.name || 'Anonymous'}</p>{currentUser?.id === post.author_id && <div className="flex gap-4 text-sm"><button onClick={() => setEditingPost(post)} className="font-semibold text-blue-600 hover:underline">Edit</button><button onClick={() => setDeletingPostId(post.id)} className="font-semibold text-red-600 hover:underline">Delete</button></div>}</div>
                                    <p className="mt-2 whitespace-pre-wrap">{post.content}</p>
                                    <div className="flex gap-4 items-center mt-4 text-sm text-gray-500">
                                        {/* THE FIX IS HERE: Using the safe Timestamp component */}
                                        <Timestamp dateString={post.created_at} />
                                        <button onClick={() => setVisibleReplies(v => ({...v, [post.id]: !v[post.id]}))} className="font-semibold hover:underline">{visibleReplies[post.id] ? 'Hide Replies' : `View ${post.replies.length} Replies`}</button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {visibleReplies[post.id] && ( <div className="pl-16 mt-4 pt-4 space-y-4 border-l-2 border-gray-100">{post.replies.map(reply => (<div key={reply.id} className="flex gap-3"><img src={reply.profiles?.image_url || 'https://placehold.co/32x32'} alt={reply.profiles?.name || 'User'} className="w-8 h-8 rounded-full object-cover mt-1" /><div className="flex-1 bg-gray-50 p-3 rounded-lg">{editingReply?.id === reply.id ? (<div><textarea value={editingReply.content} onChange={(e) => setEditingReply({ ...editingReply, content: e.target.value })} className="w-full p-2 border rounded text-sm" rows={2}/> <div className="flex justify-end gap-2 mt-2 text-xs"><button onClick={() => setEditingReply(null)}>Cancel</button><button onClick={handleSaveEditReply}>Save</button></div></div>) : (<><div className="flex justify-between items-center"><p className="font-bold text-sm">{reply.profiles?.name || 'Anonymous'}</p>{currentUser?.id === reply.author_id && <div className="flex gap-2 text-xs"><button onClick={() => setEditingReply(reply)}>Edit</button><button onClick={() => setDeletingReplyId(reply.id)}>Delete</button></div>}</div><p className="text-sm mt-1 whitespace-pre-wrap">{reply.content}</p></>)}</div></div>))}<div className="flex gap-3 pt-4"><img src={currentUser?.user_metadata.avatar_url || 'https://placehold.co/32x32'} alt="Your avatar" className="w-8 h-8 rounded-full object-cover mt-1" /><div className="flex-1"><textarea onChange={(e) => setReplyContent(prev => ({...prev, [post.id]: e.target.value}))} value={replyContent[post.id] || ''} className="w-full p-2 text-sm bg-white rounded-lg border" placeholder="Write a reply..." rows={2} /><div className="flex justify-end mt-2"><button onClick={() => handleCreateReply(post.id)} className="px-4 py-1 bg-blue-500 text-white text-sm font-semibold rounded-lg">Reply</button></div></div></div></div>)}
                    </div>
                )) : (<EmptyState title="The Forum is Quiet" message="Be the first to start a conversation!" />)}
            </div>
        </div>
    );
}