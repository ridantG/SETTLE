// File: app/admin/users/[id]/page.tsx
// FINAL VERSION: This Server Component securely fetches the detailed profile for review.

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import UserDetailClient from './UserDetailClient'; // The interactive part of the page

async function fetchUserForReview(userId: string) {
    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*') // Select all profile details
        .eq('id', userId)
        .single();

    if (error) {
        console.error("Error fetching user for review:", error);
        return null;
    }
    return data;
}

export default async function AdminUserDetailPage({ params }: { params: { id: string } }) {
    // This is a UI page. It only has a default export.
    // All POST/PATCH/DELETE logic is in a separate 'route.ts' file.
    
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/admin/login');

    const { data: adminProfile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
    if (!adminProfile?.is_admin) redirect('/');

    const userForReview = await fetchUserForReview(params.id);

    if (!userForReview) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold text-red-600">User Not Found</h1>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm p-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">Settle Admin</h1>
                    <Link href="/admin/reports" className="text-sm font-semibold text-green-600 hover:underline">
                        &larr; Back to Report Queue
                    </Link>
                </div>
            </header>
            <main className="max-w-4xl mx-auto py-8 px-4">
                <UserDetailClient profile={userForReview} />
            </main>
        </div>
    );
}