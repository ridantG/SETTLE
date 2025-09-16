// File: app/api/chat/[matchId]/messages/route.ts
// Secure, server-side endpoint for CREATING a new chat message.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
    request: Request,
    { params }: { params: { matchId: string } }
) {
    const supabase = createClient();
    const { content } = await request.json();
    const matchId = params.matchId;

    // Security Check 1: Get the user from the secure, server-side session.
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    // Security Check 2: Verify that the user is actually a member of this match.
    // This is a critical check to prevent users from injecting messages into conversations they don't belong to.
    const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('id')
        .eq('id', matchId)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .single();
    
    if (matchError || !match) {
        return NextResponse.json({ error: 'Forbidden: You are not a member of this chat.' }, { status: 403 });
    }

    // If all checks pass, insert the message.
    // The RLS policy provides the final layer of database-level security.
    const { error: insertError } = await supabase
        .from('messages')
        .insert({
            match_id: matchId,
            sender_id: user.id,
            content: content
        });

    if (insertError) {
        console.error("API Create Message Error:", insertError);
        return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Message sent successfully.' }, { status: 201 });
}