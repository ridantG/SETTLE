// File: app/api/forum/posts/route.ts
// Secure, server-side endpoint for CREATING a new post.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    const supabase = createClient();
    const { content } = await request.json();

    // Security Check 1: Get the user from the secure, server-side session.
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    // Validation Check 2: Ensure content is provided.
    if (!content || content.trim() === '') {
        return NextResponse.json({ error: 'Content is required.' }, { status: 400 });
    }

    // The database action, protected by RLS.
    const { error } = await supabase
        .from('posts')
        .insert({ author_id: user.id, content: content });

    if (error) {
        console.error("API Create Post Error:", error);
        return NextResponse.json({ error: 'Failed to create post.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Post created successfully.' }, { status: 201 });
}