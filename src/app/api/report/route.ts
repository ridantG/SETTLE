import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    const supabase = createClient();
    const { reported_user_id } = await request.json();

    // Security Check 1: Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    // Security Check 2: A user cannot report themselves
    if (user.id === reported_user_id) {
        return NextResponse.json({ error: 'You cannot report yourself.' }, { status: 400 });
    }

    // Call the database function to increment the flag count
    const { error } = await supabase.rpc('increment_flags', { user_id: reported_user_id });

    if (error) {
        console.error("API Report Error:", error);
        return NextResponse.json({ error: 'Failed to submit report.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Report submitted successfully. Our team will review it.' });
}