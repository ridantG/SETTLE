// File: app/rentals/page.tsx
// This Server Component fetches fresh data on every request.
import { createClient } from '@/lib/supabase/server';
import LoggedInHeader from '@/components/LoggedInHeader';
import { redirect } from 'next/navigation';
import RentalsClient from './RentalsClient';

export const dynamic = 'force-dynamic'; // Ensure data is always fresh

async function fetchRentals(supabase: any, searchParams: any) {
    let query = supabase.from('rentals').select('*, owner:profiles(id, name, image_url)');
    if (searchParams.q) query = query.ilike('title', `%${searchParams.q}%`);
    if (searchParams.city) query = query.ilike('city', `%${searchParams.city}%`);
    if (searchParams.category) query = query.eq('category', searchParams.category);
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    if (error) { console.error("Fetch Rentals Error:", error); return []; }
    return data || [];
}

export default async function RentalsPage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/');

    const rentals = await fetchRentals(supabase, searchParams);
    
    return (
        <div className="min-h-screen bg-gray-100">
            <LoggedInHeader />
            <main className="max-w-7xl mx-auto py-12 px-4">
                <RentalsClient initialRentals={rentals} />
            </main>
        </div>
    );
}