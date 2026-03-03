// File: app/api/rentals/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rentalSchema } from '@/lib/schemas';

export async function POST(request: Request) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.json();
    
    // 1. Validate the incoming data
    const validation = rentalSchema.safeParse(formData);
    if (!validation.success) {
        return NextResponse.json({ error: validation.error.flatten() }, { status: 400 });
    }

    // 2. Insert the validated data into the database
    const { data, error } = await supabase
        .from('rentals')
        .insert({
            ...validation.data,
            owner_id: user.id // Set the owner
        });

    if (error) {
        console.error("API Create Rental Error:", error);
        return NextResponse.json({ error: 'Failed to create listing.' }, { status: 500 });
    }
    return NextResponse.json({ message: 'Listing created successfully.' }, { status: 201 });
}