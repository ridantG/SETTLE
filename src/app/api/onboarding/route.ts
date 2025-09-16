// File: app/api/onboarding/route.ts
// A secure, server-side endpoint for saving a user's basic details.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(request: Request) {
    const supabase = createClient();
    const { name, age, gender, city } = await request.json();

    // Security Check: Get the user from the secure server-side session.
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    // Validation: Ensure required data is present.
    if (!name || !age || !gender || !city) {
        return NextResponse.json({ error: 'Name, age, gender, and city are required.' }, { status: 400 });
    }

    // Update the user's profile with the new details.
    // The RLS policy on your database provides the final layer of security.
    const { error } = await supabase
        .from('profiles')
        .update({
            name: name,
            age: parseInt(age, 10),
            gender: gender,
            city: city,
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

    if (error) {
        console.error("API Onboarding Error:", error);
        return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Profile updated successfully.' });
}