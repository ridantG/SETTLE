// File: app/dashboard/page.tsx
// FINAL VERSION: A Server Component to securely fetch initial data
// and perform the self-healing profile check.

import { createClient } from '@/lib/supabase/server';
import LoggedInHeader from '@/components/LoggedInHeader';
import Footer from '@/components/Footer';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';
import { type User } from '@supabase/supabase-js';

export default async function DashboardPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Middleware has already ensured the user is logged in.
    // This is an extra layer of certainty.
    if (!user) {
        redirect('/');
    }

    // This self-healing 'upsert' guarantees a profile exists for the logged-in user.
    const { data: profile } = await supabase
        .from('profiles')
        .upsert({ id: user.id, email: user.email, name: user.user_metadata?.full_name }, { onConflict: 'id' })
        .select('name, age, gender, city, role')
        .single();
    
    // If the user already has a role, redirect them immediately from the server.
    if (profile?.role === 'seeker') {
        redirect('/seeker-results');
    } else if (profile?.role === 'lister') {
        redirect('/roommate-results');
    }

    // If no role exists, we render the page and pass the data to the Client Component.
    return (
        <div className="min-h-screen bg-white relative">
            <LoggedInHeader />
            <DashboardClient user={user} profile={profile} />
        </div>
    );
}

