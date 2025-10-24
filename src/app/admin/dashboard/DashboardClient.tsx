// File: app/admin/dashboard/DashboardClient.tsx
// FINAL VERSION: The complete interactive UI for the dashboard.

"use client";

import Link from 'next/link';
import RecentActivityRow from './RecentActivityRow';

// --- Reusable UI Components for the Dashboard ---
const StatCard = ({ title, value, icon, link }: { title: string; value: string | number; icon: React.ReactNode; link?: string }) => {
    const cardContent = (
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-6 transition-all duration-300 hover:shadow-xl hover:scale-105">
            <div className="bg-green-100 p-4 rounded-full">{icon}</div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
    return link ? <Link href={link} className="block">{cardContent}</Link> : cardContent;
};

// --- SVG Icons ---
const ReportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const NewUserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const TotalUsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm-9 3a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;

export default function DashboardClient({ dashboardData }: { dashboardData: any }) {
    return (
        <>
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Open Reports" value={dashboardData.openReports} icon={<ReportIcon />} link="/admin/reports" />
                <StatCard title="New Users (24h)" value={dashboardData.newUsers} icon={<NewUserIcon />} link="/admin/users?new=true" />
                <StatCard title="Total Active Users" value={dashboardData.totalUsers} icon={<TotalUsersIcon />} link="/admin/users" />
            </div>
            <div className="mt-12 bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4">Recent Activity (Last 5 Signups)</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {dashboardData.recentActivity.map((activity: any) => (
                                
                             <RecentActivityRow key={activity.id} activity={activity} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}