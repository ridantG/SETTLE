// File: app/api/chat/[matchId]/messages/route.ts

import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Correct Next.js App Router signature
export async function POST(
    request: NextRequest,
    context: { params: Promise<{ matchId: string }> }
) {
    const { matchId } = await context.params;

    const supabase = createClient();
    const { content } = await request.json();

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
        .insert({
            match_id: matchId,
            sender_id: user.id,
            content
        });

    if (insertError) {
        return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 });
    }

    return NextResponse.json(
        { message: 'Message sent successfully.' },
        { status: 201 }
    );
}
