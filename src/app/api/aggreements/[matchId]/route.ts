// File: app/api/agreements/[matchId]/route.ts
// This secure, server-side endpoint handles the submission of a Settle Agreement.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
    request: Request,
    { params }: { params: { matchId: string } }
) {
    const supabase = createClient();
    const { responses } = await request.json();
    const matchId = params.matchId;

    // Security Check 1: Get the user from the secure server-side session.
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    // Security Check 2: Verify that the user is actually a member of this match.
    // This prevents a user from submitting an agreement for a match they are not a part of.
    const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('id, user1_id, user2_id')
        .eq('id', matchId)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .single();
    
    if (matchError || !match) {
        return NextResponse.json({ error: 'Forbidden: You are not a member of this match.' }, { status: 403 });
    }

    // Step 1: Insert the user's agreement responses into the database.
    // The unique constraint in our database schema prevents a user from submitting twice.
    const { error: insertError } = await supabase
        .from('agreements')
        .insert({
            match_id: matchId,
            user_id: user.id,
            responses: responses
        });
    
    if (insertError) {
        console.error("API Agreement Insert Error:", insertError);
        return NextResponse.json({ error: 'Failed to submit agreement. You may have already submitted one.' }, { status: 500 });
    }

    // Step 2: After a successful submission, check if the *other* user has also submitted.
    const { data: allAgreements, error: checkError } = await supabase
        .from('agreements')
        .select('id')
        .eq('match_id', matchId);
    
    if (checkError) {
        // The submission was saved, but we can't check the match status right now.
        // The user can check back later.
        console.error("API Agreement Check Error:", checkError);
        return NextResponse.json({ message: 'Agreement submitted, but status could not be verified.' });
    }

    // Step 3: If both users (count is 2) have submitted, finalize the match by updating its status.
    // This is the "key turn" moment that unlocks the chat.
    if (allAgreements && allAgreements.length === 2) {
        const { error: updateError } = await supabase
            .from('matches')
            .update({ status: 'active' })
            .eq('id', matchId);

        if (updateError) {
            console.error("API Match Finalize Error:", updateError);
            // Again, the submission was saved, but the finalization failed.
            return NextResponse.json({ message: 'Agreement submitted, but match finalization failed.' });
        }
    }

    return NextResponse.json({ message: 'Agreement submitted successfully.' });
}