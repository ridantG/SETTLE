// File: app/api/like/route.ts
// A secure, server-side endpoint for creating a like and checking for a match.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    const supabase = createClient();
    const { liked_id } = await request.json();

    // 1. Validate the incoming data
    if (!liked_id) {
        return NextResponse.json({ error: 'Liked user ID is required' }, { status: 400 });
    }

    // 2. Get the current user from the secure session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized: You must be logged in' }, { status: 401 });
    }

    // 3. Call the atomic PostgreSQL function on the server
    const { data: matchCreated, error } = await supabase.rpc('create_like_and_check_match', {
        liker_id_param: user.id,
        liked_id_param: liked_id
    });

    if (error) {
        return NextResponse.json({ error: 'An error occurred while processing your request.' }, { status: 500 });
    }

    // 4. Return the result to the client
    return NextResponse.json({ matchCreated });
}