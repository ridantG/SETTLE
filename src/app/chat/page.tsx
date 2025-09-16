// File: app/chat/page.tsx
// FINAL VERSION: The main "inbox" page that lists all of a user's chats.

import { createClient } from '@/lib/supabase/server';
import LoggedInHeader from '@/components/LoggedInHeader';
import EmptyState from '@/components/EmptyState';
import { type User } from '@supabase/supabase-js';
import Link from 'next/link';
import { redirect } from 'next/navigation';

// This type defines the shape of our data: a match with the full profile of both users.
type MatchWithProfiles = {
    id: string; // The match ID, used for the chat link
    user1: { id: string; name: string | null; image_url: string | null; };
    user2: { id: string; name: string | null; image_url: string | null; };
};

// This function runs securely on the server to fetch all of a user's matches.
async function fetchMatches(userId: string): Promise<MatchWithProfiles[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('matches')
        .select(`
            id,
            user1:profiles!matches_user1_id_fkey (id, name, image_url),
            user2:profiles!matches_user2_id_fkey (id, name, image_url)
        `)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

    if (error) {
        console.error("Fetch Matches Error:", error);
        return [];
    }
    return (data as any[]) || [];
}

export default async function ChatsListPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const matches = await fetchMatches(user.id);

    return (
        <div className="min-h-screen bg-gray-100">
            <LoggedInHeader />
            <main className="max-w-4xl mx-auto py-12 px-4">
                <h1 className="text-4xl font-bold text-gray-800 mb-8">My Chats</h1>
                <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
                    {matches.length > 0 ? (
                        <div className="space-y-2">
                            {matches.map((match) => {
                                // Determine who the "other user" is in the match
                                const otherUser = match.user1.id === user.id ? match.user2 : match.user1;
                                return (
                                    <Link 
                                        key={match.id}
                                        href={`/chat/${match.id}`}
                                        className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <img 
                                            src={otherUser.image_url || 'https://placehold.co/56x56'} 
                                            alt={otherUser.name || 'User'}
                                            className="w-14 h-14 rounded-full object-cover"
                                        />
                                        <div>
                                            <h2 className="font-bold text-lg text-gray-800">{otherUser.name || 'User'}</h2>
                                            <p className="text-sm text-gray-500">Click to view conversation</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <EmptyState
                            title="No Matches Yet"
                            message="When you and another user are both interested, your new match will appear here."
                            actionText="Browse Profiles"
                            actionHref="/dashboard"
                        />
                    )}
                </div>
            </main>
        </div>
    );
}