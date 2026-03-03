// File: app/admin/dashboard/RecentActivityRow.tsx
// This component safely handles client-side date formatting to prevent hydration errors.

"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function RecentActivityRow({ activity }: { activity: any }) {
    const [formattedDate, setFormattedDate] = useState(activity.created_at);

    // This effect runs ONLY on the client, after the initial render.
    useEffect(() => {
        // We format the date to the user's local timezone and update the state.
        setFormattedDate(new Date(activity.created_at).toLocaleString());
    }, [activity.created_at]); // Dependency array ensures this runs if the data changes

    return (
        <tr key={activity.id}>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {activity.name || 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {activity.email}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formattedDate}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {activity.is_suspended ? (
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-800">Suspended</span>
                ) : (
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                )}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {activity.role || 'N/A'}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                <Link
                    href={`/admin/users/${activity.id}`}
                    className="text-blue-600 hover:underline"
                >
                    View Profile
                </Link>
            </td>
        </tr>
    );
}