// File: app/api/profile/route.ts
// A secure, server-side endpoint for updating a user's profile.

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server'; // Use the secure server client

// Define what fields a user is allowed to update
type UpdatableProfileFields = {
    name?: string;
    age?: number;
    status?: string;
    organization?: string;
    diet?: string;
    description?: string;
    image_url?: string;
    drinks?: boolean;
    smokes?: boolean;
    flat_image_urls?: string[];
};

export async function PATCH(request: Request) {
    const supabase = createClient();
    const requestData: UpdatableProfileFields = await request.json();

    // SECURITY CHECK 1: Get the user from the secure server-side session.
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized: You must be logged in.' }, { status: 401 });
    }

    // SECURITY CHECK 2: Sanitize the data to prevent unwanted updates.
    // We only include fields the user is explicitly allowed to change.
    const sanitizedProfileData: UpdatableProfileFields = {
        name: requestData.name,
        age: requestData.age,
        status: requestData.status,
        organization: requestData.organization,
        diet: requestData.diet,
        description: requestData.description,
        image_url: requestData.image_url,
        drinks: requestData.drinks,
        smokes: requestData.smokes,
        flat_image_urls: requestData.flat_image_urls,
    };

    // SECURITY CHECK 3: The database query itself.
    // We update the 'profiles' table WHERE the 'id' column matches the authenticated user's ID.
    const { error } = await supabase
        .from('profiles')
        .update({
            ...sanitizedProfileData,
            updated_at: new Date().toISOString(),
        })
        .eq('id', user.id); // This is the crucial authorization check.

    if (error) {
        return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Profile updated successfully.' });
}