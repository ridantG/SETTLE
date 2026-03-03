// File: app/admin/users/[id]/page.tsx
// FINAL, DEFINITIVE VERSION: Corrected PageProps type error.

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import UserDetailClient from './UserDetailClient';
import { type Profile } from '@/lib/schemas'; // Import the correct type

async function fetchUserForReview(userId: string) {
    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin.from('profiles').select('*').eq('id', userId).single();
    if (error) { console.error("Error fetching user:", error); return null; }
    return data;
}

// THE FIX IS HERE: The prop type is now correct and standard.
export default async function AdminUserDetailPage({ params }: { params: { id: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/admin/login');

    const { data: adminProfile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
    if (!adminProfile?.is_admin) redirect('/');

    const userForReview = await fetchUserForReview(params.id);

    if (!userForReview) {
        return ( <div className="p-8"><h1 className="text-2xl font-bold text-red-600">User Not Found</h1></div> );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm p-4"><div className="max-w-7xl mx-auto flex justify-between"><h1 className="text-2xl font-bold">Settle Admin</h1><Link href="/admin/reports" className="text-sm font-semibold">&larr; Back to Reports</Link></div></header>
            <main className="max-w-4xl mx-auto py-8 px-4">
                <UserDetailClient profile={userForReview as Profile} />
            </main>
        </div>
    );
}