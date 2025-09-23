// File: app/chat/page.tsx
// FINAL VERSION: A simple, clean inbox for all active chats.

import { createClient } from '@/lib/supabase/server';
import LoggedInHeader from '@/components/LoggedInHeader';
import EmptyState from '@/components/EmptyState';
import Link from 'next/link';
import { redirect } from 'next/navigation';

type MatchWithProfiles = { id: string; user1: { id: string; name: string | null; image_url: string | null; }; user2: { id: string; name: string | null; image_url: string | null; }; };

async function fetchMatches(userId: string): Promise<MatchWithProfiles[]> {
    const supabase = createClient();
    const { data, error } = await supabase.from('matches').select(`id, user1:profiles!matches_user1_id_fkey(*), user2:profiles!matches_user2_id_fkey(*)`).or(`user1_id.eq.${userId},user2_id.eq.${userId}`);
    if (error) return [];
    return (data as any[]) || [];
}

export default async function ChatsListPage() {
    const { data: { user } } = await createClient().auth.getUser();
    if (!user) redirect('/');
    const matches = await fetchMatches(user.id);

    return (
        <div className="min-h-screen bg-gray-100">
            <LoggedInHeader />
            <main className="max-w-4xl mx-auto py-12 px-4">
                <h1 className="text-4xl font-bold mb-8">My Chats</h1>
                <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
                    {matches.length > 0 ? (
                        <div className="space-y-2">
                            {matches.map((match) => {
                                const otherUser = match.user1.id === user.id ? match.user2 : match.user1;
                                return (
                                    <Link key={match.id} href={`/chat/${match.id}`} className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50">
                                        <img src={otherUser.image_url || 'https://placehold.co/56x56'} alt={otherUser.name || 'User'} className="w-14 h-14 rounded-full object-cover"/>
                                        <div>
                                            <h2 className="font-bold text-lg">{otherUser.name || 'User'}</h2>
                                            <p className="text-sm text-gray-500">Click to view conversation</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : ( <EmptyState title="No Matches Yet" message="When you and another user are both interested, your new match will appear here." /> )}
                </div>
            </main>
        </div>
    );
}