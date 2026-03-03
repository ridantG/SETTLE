// File: app/admin/dashboard/page.tsx
// FINAL, DEFINITIVE VERSION: The secure Server Component for your dashboard.

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DashboardClient from './DashboardClient'; // The interactive client component

async function getDashboardData() {
    const supabaseAdmin = createAdminClient();
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [
        openReportsRes,
        newUsersRes,
        totalUsersRes,
        recentActivityRes,
        activeUsersRes,
        suspendedUsersRes,
        flaggedUsersRes,
        newUsers7dRes
    ] = await Promise.all([
        supabaseAdmin.from('profiles').select('id', { count: 'exact' }).gt('flags', 0),
        supabaseAdmin.from('profiles').select('id', { count: 'exact' }).gte('created_at', twentyFourHoursAgo),
        supabaseAdmin.from('profiles').select('id', { count: 'exact' }),
        supabaseAdmin.from('profiles').select('id, name, email, created_at, is_suspended, role').order('created_at', { ascending: false }).limit(5),
        supabaseAdmin.from('profiles').select('id', { count: 'exact' }).eq('is_suspended', false),
        supabaseAdmin.from('profiles').select('id', { count: 'exact' }).eq('is_suspended', true),
        supabaseAdmin.from('profiles').select('id', { count: 'exact' }).gt('flags', 0),
        supabaseAdmin.from('profiles').select('id', { count: 'exact' }).gte('created_at', sevenDaysAgo)
    ]);

    return {
        openReports: openReportsRes.count ?? 0,
        newUsers: newUsersRes.count ?? 0,
        totalUsers: totalUsersRes.count ?? 0,
        recentActivity: recentActivityRes.data ?? [],
        activeUsers: activeUsersRes.count ?? 0,
        suspendedUsers: suspendedUsersRes.count ?? 0,
        flaggedUsers: flaggedUsersRes.count ?? 0,
        newUsers7d: newUsers7dRes.count ?? 0
    };
}

export default async function AdminDashboardPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        // This check is now primarily handled by middleware, but serves as a final safeguard.
        redirect('/admin/login');
    }

    const dashboardData = await getDashboardData();

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm p-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">Settle Admin</h1>
                    {/* In a real app, you'd have an admin-specific logout */}
                    <Link href="/" className="text-sm font-semibold text-green-600 hover:underline">
                        View Main Site
                    </Link>
                </div>
            </header>
            <main className="max-w-7xl mx-auto py-8 px-4">
                {/* We pass the fetched data to the Client Component for interaction */}
                <DashboardClient dashboardData={dashboardData} />
            </main>
        </div>
    );
}