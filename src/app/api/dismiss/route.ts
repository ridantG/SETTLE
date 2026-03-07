// File: app/api/dismiss/route.ts
// FINAL, CORRECTED VERSION: With the correct 'dismisser_id' column name.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    const supabase = createClient();
    const { dismissed_id } = await request.json();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    if (user.id === dismissed_id) return NextResponse.json({ error: 'You cannot dismiss yourself.' }, { status: 400 });

    // THE FIX IS HERE: The column name 'dismisser_id' is now correct.
    const { error } = await supabase
        .from('dismissals')
        .insert({ dismisser_id: user.id, dismissed_id: dismissed_id });

    if (error && error.code !== '23505') { // Ignore unique violation errors
        console.error("API Dismiss Error:", error);
        return NextResponse.json({ error: 'Failed to record dismissal.' }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'Dismissal recorded.' });
}