import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(request: Request) {
    const supabase = createClient();
    
    // Get the currently logged-in user from their secure cookie.
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use the admin client to perform the privileged deletion operation.
    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: 'A server error occurred.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Account deleted successfully.' });
}