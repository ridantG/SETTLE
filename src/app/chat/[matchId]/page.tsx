// File: app/chat/[matchId]/page.tsx
// FINAL VERSION: Now securely fetches all necessary data for the chat header menu.

import { createClient } from '@/lib/supabase/server';
import LoggedInHeader from '@/components/LoggedInHeader';
import ChatUI from './ChatUI';
import { notFound, redirect } from 'next/navigation';

export type MessageWithAuthor = { id: number; content: string; created_at: string; sender_id: string; profiles: { name: string | null; image_url: string | null; } | null; };
// This type now includes the other user's id and role.
export type OtherUser = { id: string; name: string | null; image_url: string | null; role: 'seeker' | 'lister' | null; };

async function fetchChatData(matchId: string, currentUserId: string) {
    const supabase = createClient();
    const { data: matchData, error: matchError } = await supabase.from('matches').select('user1_id, user2_id').eq('id', matchId).or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`).single();
    if (matchError || !matchData) return null;
    
    const otherUserId = matchData.user1_id === currentUserId ? matchData.user2_id : matchData.user1_id;

    // THE FIX IS HERE: We now select 'id' and 'role' in addition to name and image_url.
    const [messagesPromise, otherUserPromise] = await Promise.all([
        supabase.from('messages').select('*, profiles:sender_id(*)').eq('match_id', matchId).order('created_at', { ascending: true }),
        supabase.from('profiles').select('id, name, image_url, role').eq('id', otherUserId).single()
    ]);

    if (messagesPromise.error || otherUserPromise.error) return null;
    
    return {
        initialMessages: (messagesPromise.data as MessageWithAuthor[]) || [],
        otherUser: otherUserPromise.data as OtherUser
    };
}

export default async function ChatPage({ params }: { params: { matchId: string } }) {
    const { data: { user } } = await createClient().auth.getUser();
    if (!user) redirect('/');
    const chatData = await fetchChatData(params.matchId, user.id);
    if (!chatData) notFound();

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <LoggedInHeader />
            <ChatUI initialMessages={chatData.initialMessages} otherUser={chatData.otherUser} currentUser={user} matchId={params.matchId}/>
        </div>
    );
}