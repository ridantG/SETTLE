// File: src/components/Timestamp.tsx
// A special, client-only component to safely render localized dates
// and prevent hydration errors.

"use client";

import { useState, useEffect } from 'react';

type TimestampProps = {
    dateString: string;
};

export default function Timestamp({ dateString }: TimestampProps) {
    const [hydrated, setHydrated] = useState(false);
    const [formattedDate, setFormattedDate] = useState('');

    useEffect(() => {
        // This effect runs ONLY on the client, after the initial render.
        setHydrated(true);
        // We calculate the localized string here, safely on the client.
        try {
            setFormattedDate(new Date(dateString).toLocaleString());
        } catch (e) {
            setFormattedDate('Invalid date');
        }
    }, [dateString]);

    // Until the component has hydrated, we don't render the time.
    // This guarantees the server and client match.
    if (!hydrated) {
        return null; 
    }

    return <span className="text-xs text-gray-400">{formattedDate}</span>;
}