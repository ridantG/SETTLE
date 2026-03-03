// File: app/api/rentals/contact/route.ts
// This API finds or creates a match for a rental item and returns the chat ID.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { owner_id } = await request.json();
    if (!owner_id) {
        return NextResponse.json({ error: 'Owner ID is required.' }, { status: 400 });
    }

    if (user.id === owner_id) {
        return NextResponse.json({ error: 'You cannot contact yourself.' }, { status: 400 });
    }

    // 1. Check if a match (a chat room) already exists between these two users.
    // We must check both directions (user1_id, user2_id) and (user2_id, user1_id).
    const { data: existingMatch, error: searchError } = await supabase
        .from('matches')
        .select('id')
        .or(`(user1_id.eq.${user.id},user2_id.eq.${owner_id}),(user1_id.eq.${owner_id},user2_id.eq.${user.id})`)
        .single();

    if (searchError && searchError.code !== 'PGRST116') { // PGRST116 = row not found
        console.error("Match search error:", searchError);
        return NextResponse.json({ error: 'Error finding existing chat.' }, { status: 500 });
    }
    
    // 2. If a match already exists, return its ID.
    if (existingMatch) {
        return NextResponse.json({ match_id: existingMatch.id });
    }

    // 3. If no match exists, create a new one.
    const { data: newMatch, error: createError } = await supabase
        .from('matches')
        .insert({
            user1_id: user.id,
            user2_id: owner_id,
        })
        .select('id')
        .single();

    if (createError) {
        console.error("Match create error:", createError);
        return NextResponse.json({ error: 'Failed to create a new chat.' }, { status: 500 });
    }

    // 4. Return the new match ID.
    return NextResponse.json({ match_id: newMatch.id }, { status: 201 });
}