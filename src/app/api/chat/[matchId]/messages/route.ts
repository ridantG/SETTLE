// File: app/api/chat/[matchId]/messages/route.ts
// FINAL, SIMPLIFIED VERSION: No longer checks for 'active' status.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
    request: Request,
    { params }: { params: { matchId: string } }
) {
    const supabase = createClient();
    const { content } = await request.json();
    const matchId = params.matchId;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    // Security Check: Verify the user is part of this match.
    const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('status')
        .eq('id', matchId)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .single();
    
    if (matchError || !match) {
        return NextResponse.json({ error: 'Forbidden: You are not a member of this chat.' }, { status: 403 });
    }
    
    // If the check passes, insert the message.
    const { error: insertError } = await supabase
        .from('messages')
        .insert({ match_id: matchId, sender_id: user.id, content: content });

    if (insertError) {
        return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Message sent successfully.' }, { status: 201 });
}