// File: app/api/forum/posts/[postId]/replies/route.ts
// Secure, server-side endpoint for CREATING a new reply.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request, { params }: { params: { postId: string } }) {
    const supabase = createClient();
    const { content } = await request.json();
    const postId = params.postId;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    if (!content) return NextResponse.json({ error: 'Content is required.' }, { status: 400 });

    const { error } = await supabase
        .from('replies')
        .insert({ author_id: user.id, content: content, post_id: postId });

    if (error) {
        console.error("API Create Reply Error:", error);
        return NextResponse.json({ error: 'Failed to create reply.' }, { status: 500 });
    }
    return NextResponse.json({ message: 'Reply created successfully.' }, { status: 201 });
}