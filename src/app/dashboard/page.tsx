// File: src/app/dashboard/page.tsx
// FINAL VERSION: The secure entry point for the User Dashboard.

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import LoggedInHeader from '@/components/LoggedInHeader';
import Footer from '@/components/Footer';
import DashboardClient from './DashboardClient'; 

export default async function DashboardPage() {
    const supabase = createClient();
    
    // 1. Securely fetch the current user
    const { data: { user } } = await supabase.auth.getUser();

    // 2. Security Guard: If not logged in, kick them out to the landing page.
    if (!user) {
        redirect('/');
    }

    // 3. Data Consistency (Self-Healing)
    // We use 'upsert' to guarantee a profile row exists. 
    // This prevents "null profile" errors if the signup hook failed.
    const { data: profile } = await supabase
        .from('profiles')
        .upsert({ 
            id: user.id, 
            email: user.email, 
            name: user.user_metadata?.full_name 
        }, { onConflict: 'id' })
        .select('*')
        .single();
    
    // 4. Admin Redirect
    // Admins have a totally different dashboard, so we send them away.
    if (profile?.is_admin) {
        redirect('/admin/dashboard');
    }

    // 5. Render the Dashboard Menu
    // We do NOT redirect Seekers or Listers automatically anymore.
    // We let them see the menu so they can choose to go to "Forum", "Tiffin", etc.
    return (
        <div className="min-h-screen bg-white relative flex flex-col">
            <LoggedInHeader />
            
            {/* Pass the server-fetched data to the Client Component */}
            <DashboardClient user={user} profile={profile} />
            
        </div>
    );
}