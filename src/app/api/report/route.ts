// File: app/api/report/route.ts
// FINAL, CORRECTED VERSION
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reported_user_id } = await request.json();
    if (!reported_user_id) {
        return NextResponse.json({ error: 'Reported user ID is required.' }, { status: 400 });
    }

    // Call the secure, server-side database function to increment the flag.
    const { error } = await supabase.rpc('increment_flags', { user_id_to_report: reported_user_id });

    if (error) {
        console.error("API Report Error:", error);
        return NextResponse.json({ error: 'Failed to submit report.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Report submitted successfully. Our team will review it.' });
}