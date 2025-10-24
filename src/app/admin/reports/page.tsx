// File: app/admin/reports/page.tsx
// The definitive, secure, server-rendered Report Queue page.

import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';

// This function runs securely on the server using the admin client.
async function fetchReportedUsers() {
    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('id, name, email, flags, created_at')
        .gt('flags', 0) // Fetch users with one or more reports
        .order('flags', { ascending: false }); // Show most-reported users first

    if (error) {
        console.error("Error fetching reported users:", error);
        return [];
    }
    return data;
}

export default async function ReportQueuePage() {
    const reportedUsers = await fetchReportedUsers();

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
                <h2 className="text-3xl font-bold mb-6 text-gray-900">User Report Queue</h2>
                
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Report Count</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Joined</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reportedUsers.length > 0 ? (
                                    reportedUsers.map((reportedUser: any) => (
                                        <tr key={reportedUser.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {reportedUser.name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {reportedUser.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-red-600">
                                                {reportedUser.flags}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(reportedUser.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    href={`/admin/users/${reportedUser.id}`}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    Review User
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="text-center py-10 text-gray-500">
                                            The report queue is clear. Well done!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}