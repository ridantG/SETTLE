// File: app/api/chat/[matchId]/messages/route.ts
// FINAL, CORRECTED VERSION with the correct App Router function signature.

import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// THE FIX IS HERE: The function signature now correctly matches the
// modern Next.js App Router standard.
export async function POST(
    request: NextRequest,
    { params }: { params: { matchId: string } }
) {
    const supabase = createClient();
    const { content } = await request.json();
    const matchId = params.matchId;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { data: match } = await supabase
        .from('matches')
        .select('id')
        .eq('id', matchId)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .single();
    
    if (!match) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const { error: insertError } = await supabase
        .from('messages')
        .insert({ match_id: matchId, sender_id: user.id, content });

    if (insertError) {
        return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Message sent successfully.' }, { status: 201 });
}