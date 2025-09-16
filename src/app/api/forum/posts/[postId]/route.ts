// File: app/api/forum/posts/[postId]/route.ts
// Secure, server-side endpoints for UPDATING and DELETING a single post.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Function to handle UPDATING a post
export async function PATCH(request: Request, { params }: { params: { postId: string } }) {
    const supabase = createClient();
    const { content } = await request.json();
    const postId = params.postId;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    if (!content) return NextResponse.json({ error: 'Content is required.' }, { status: 400 });

    // The RLS policy 'Users can update their own posts' provides the ultimate security here.
    const { error } = await supabase
        .from('posts')
        .update({ content: content, updated_at: new Date().toISOString() })
        .eq('id', postId)
        .eq('author_id', user.id); // API-level check adds another layer of security.

    if (error) {
        console.error("API Update Post Error:", error);
        return NextResponse.json({ error: 'Failed to update post.' }, { status: 500 });
    }
    return NextResponse.json({ message: 'Post updated successfully.' });
}

// Function to handle DELETING a post
export async function DELETE(request: Request, { params }: { params: { postId: string } }) {
    const supabase = createClient();
    const postId = params.postId;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('author_id', user.id);

    if (error) {
        console.error("API Delete Post Error:", error);
        return NextResponse.json({ error: 'Failed to delete post.' }, { status: 500 });
    }
    return NextResponse.json({ message: 'Post deleted successfully.' });
}