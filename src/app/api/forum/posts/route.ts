// File: app/api/forum/posts/route.ts
// FINAL, DEFINITIVE, AND SELF-HEALING VERSION

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // THE DEFINITIVE FIX IS HERE: The Self-Healing 'upsert'
    // This command guarantees that a profile exists for the logged-in user before we proceed.
    // It checks for a profile with the user's ID. If it doesn't exist, it creates one.
    const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({ id: user.id, email: user.email }, { onConflict: 'id' });

    if (upsertError) {
        console.error("Profile Upsert Error:", upsertError);
        return NextResponse.json({ error: 'Failed to verify user profile.' }, { status: 500 });
    }

    // Now that we have guaranteed a profile exists, we can safely create the post.
    const { content } = await request.json();
    if (!content) {
        return NextResponse.json({ error: 'Content is required.' }, { status: 400 });
    }

    const { error: insertError } = await supabase
        .from('posts')
        .insert({ content: content, author_id: user.id });

    if (insertError) {
        console.error("API Create Post Error:", insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Post created successfully.' }, { status: 201 });
}