// File: app/dashboard/page.tsx
// FINAL, SELF-HEALING VERSION: A Server Component to securely fetch data
// and perform the self-healing profile check using 'upsert'.

import { createClient } from '@/lib/supabase/server';
import LoggedInHeader from '@/components/LoggedInHeader';
import Footer from '@/components/Footer';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';
import { type User } from '@supabase/supabase-js';

export default async function DashboardPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    // THE DEFINITIVE FIX IS HERE: The Self-Healing 'upsert'
    // This command guarantees that a profile exists for the logged-in user.
    // 1. It tries to find a profile with the user's ID.
    // 2. If it finds one, it does nothing but returns the data.
    // 3. If it does NOT find one, it atomically INSERTS a new profile.
    const { data: profile, error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, email: user.email, name: user.user_metadata?.full_name }, { onConflict: 'id' })
        .select('name, age, gender, city, role')
        .single();
    
    if (error && error.code !== 'PGRST116') { // Ignore 'PGRST116' (row not found) as upsert handles it.
        console.error("Dashboard Self-Healing Error:", error);
    }

    // If the user already has a role, redirect them immediately from the server.
    if (profile?.role === 'seeker') {
        redirect('/seeker-results');
    } else if (profile?.role === 'lister') {
        redirect('/roommate-results');
    }

    // If no role exists, we render the page and pass the data to the Client Component.
    return (
        <div className="min-h-screen bg-white relative">
            {/* The header is removed from the main page, as requested before. */}
            <DashboardClient user={user} profile={profile} />
            
        </div>
    );
}