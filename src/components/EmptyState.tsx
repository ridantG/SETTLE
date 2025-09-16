// File: src/components/EmptyState.tsx
// A reusable component to display when a list or grid is empty.

"use client";

import React from 'react';
import Link from 'next/link';

// Simple SVG for visual polish
const EmptyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

// Define the props this component accepts
type EmptyStateProps = {
    title: string;
    message: string;
    actionText?: string; // Optional: Text for a call-to-action button
    actionHref?: string; // Optional: The link for the button
};

export default function EmptyState({ title, message, actionText, actionHref }: EmptyStateProps) {
    return (
        <div className="text-center bg-white p-12 rounded-2xl shadow-xl w-full">
            <EmptyIcon />
            <h2 className="mt-4 text-3xl font-bold text-gray-800">{title}</h2>
            <p className="mt-2 text-gray-600">{message}</p>
            {actionText && actionHref && (
                <div className="mt-6">
                    <Link 
                        href={actionHref}
                        className="inline-block px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors"
                    >
                        {actionText}
                    </Link>
                </div>
            )}
        </div>
    );
}