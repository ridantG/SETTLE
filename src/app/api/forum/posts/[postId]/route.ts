// File: app/api/forum/posts/[postId]/route.ts
// Secure API route for updating and deleting a post.

import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// UPDATE a post
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
    const { postId } = await context.params;

    const supabase = createClient();
    const { content } = await request.json();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user)
        return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    if (!content)
        return NextResponse.json({ error: 'Content is required.' }, { status: 400 });

    const { error } = await supabase
        .from('posts')
        .update({
            content,
            updated_at: new Date().toISOString()
        })
        .eq('id', postId)
        .eq('author_id', user.id);

    if (error) {
        console.error('API Update Post Error:', error);
        return NextResponse.json({ error: 'Failed to update post.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Post updated successfully.' });
}

// DELETE a post
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
    const { postId } = await context.params;

    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user)
        return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

    const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('author_id', user.id);

    if (error) {
        console.error('API Delete Post Error:', error);
        return NextResponse.json({ error: 'Failed to delete post.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Post deleted successfully.' });
}
