// File: app/api/admin/users/[id]/route.ts
// FINAL, DEFINITIVE, AND SECURE VERSION

import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

async function isAdmin(supabase: any): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    const { data: adminProfile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
    return adminProfile?.is_admin === true;
}

// Function to handle UPDATING a user's status (reset flags, suspend)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    const supabase = createClient();
    if (!(await isAdmin(supabase))) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { action, value } = await request.json();
    const supabaseAdmin = createAdminClient();
    let updateData = {};

    if (action === 'reset_flags') {
        updateData = { flags: 0 };
    } else if (action === 'suspend') {
        updateData = { is_suspended: value };
    } else {
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('profiles').update(updateData).eq('id', params.id);
    
    if (error) {
        console.error("Admin PATCH Error:", error);
        return NextResponse.json({ error: 'Failed to update user profile.' }, { status: 500 });
    }
    return NextResponse.json({ message: 'User updated successfully.' });
}

// Function to handle BANNING (deleting) a user
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !(await isAdmin(supabase))) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (user.id === params.id) {
        return NextResponse.json({ error: "Administrators cannot ban their own account." }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin.auth.admin.deleteUser(params.id);
    
    if (error) {
        console.error("Admin DELETE Error:", error);
        return NextResponse.json({ error: 'Failed to ban user.' }, { status: 500 });
    }
    return NextResponse.json({ message: 'User has been banned and all their data has been deleted.' });
}