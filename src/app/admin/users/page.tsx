// File: app/admin/users/page.tsx
// The definitive, secure, server-rendered User Management page.

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';

// This function securely fetches a list of all users.
// It can also filter for new users based on the URL search parameter.
async function fetchAllUsers(searchParams: { [key: string]: string | undefined }) {
    const supabaseAdmin = createAdminClient();
    let query = supabaseAdmin
        .from('profiles')
        .select('id, name, email, role, created_at, is_suspended, flags');

    // If the URL has '?new=true', filter for users created in the last 24 hours.
    if (searchParams.new === 'true') {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('created_at', twentyFourHoursAgo);
    }

    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    if (error) {
        console.error("Error fetching all users:", error);
        return [];
    }
    return data;
}

export default async function UserManagementPage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/admin/login');

    const { data: adminProfile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
    if (!adminProfile?.is_admin) redirect('/');

    const allUsers = await fetchAllUsers(searchParams);
    const pageTitle = searchParams.new === 'true' ? "New Users (Last 24h)" : "All Active Users";

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm p-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">Settle Admin</h1>
                    <Link href="/admin/dashboard" className="text-sm font-semibold text-green-600 hover:underline">
                        &larr; Back to Dashboard
                    </Link>
                </div>
            </header>
            
            <main className="max-w-7xl mx-auto py-8 px-4">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">{pageTitle}</h2>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reports</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Joined</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {allUsers.map((profile: any) => (
                                    <tr key={profile.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{profile.name || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{profile.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${profile.is_suspended ? 'bg-gray-200 text-gray-800' : 'bg-green-100 text-green-800'}`}>
                                                {profile.is_suspended ? 'Suspended' : 'Active'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-red-600">{profile.flags}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(profile.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link href={`/admin/users/${profile.id}`} className="text-green-600 hover:text-green-900">
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}