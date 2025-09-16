// File: app/dashboard/page.tsx
// This Server Component fetches data and passes it to the client.

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

    const { data: profile } = await supabase
        .from('profiles')
        .select('name, age, gender, city, role')
        .eq('id', user.id)
        .single();
    
    if (profile?.role === 'seeker') {
        redirect('/seeker-results');
    } else if (profile?.role === 'lister') {
        redirect('/roommate-results');
    }

    return (
        <div className="min-h-screen bg-white relative">
            <LoggedInHeader />
            <DashboardClient user={user} profile={profile} />
        </div>
    );
}