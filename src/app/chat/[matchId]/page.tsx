// File: app/chat/[matchId]/page.tsx
// FINAL VERSION: A Server Component to securely fetch initial chat data.

import { createClient } from '@/lib/supabase/server';
import LoggedInHeader from '@/components/LoggedInHeader';
import ChatUI from './ChatUI'; // The interactive client component
import { type User } from '@supabase/supabase-js';
import { notFound, redirect } from 'next/navigation';

// Define the data shapes for type safety
export type MessageWithAuthor = {
    id: number;
    content: string;
    created_at: string;
    sender_id: string;
    profiles: {
        name: string | null;
        image_url: string | null;
    } | null;
};

// This function runs securely on the server to fetch all necessary data.
async function fetchChatData(matchId: string, currentUserId: string) {
    const supabase = createClient();

    // First, verify the user is part of this match
    const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select('user1_id, user2_id')
        .eq('id', matchId)
        .or(`user1_id.eq.${currentUserId},user2_id.eq.${currentUserId}`)
        .single();

    if (matchError || !matchData) {
        return null; // The user is not part of this match, or it doesn't exist.
    }
    
    // Determine the ID of the other user in the chat
    const otherUserId = matchData.user1_id === currentUserId ? matchData.user2_id : matchData.user1_id;

    // Fetch the other user's profile and the message history in parallel
    const [messagesPromise, otherUserPromise] = await Promise.all([
        supabase
            .from('messages')
            .select('*, profiles:sender_id(*)')
            .eq('match_id', matchId)
            .order('created_at', { ascending: true }),
        supabase
            .from('profiles')
            .select('name, image_url')
            .eq('id', otherUserId)
            .single()
    ]);

    if (messagesPromise.error || otherUserPromise.error) {
        console.error("Chat Data Fetch Error:", messagesPromise.error || otherUserPromise.error);
        return null;
    }

    return {
        initialMessages: (messagesPromise.data as MessageWithAuthor[]) || [],
        otherUser: otherUserPromise.data
    };
}

// The main page component
export default async function ChatPage({ params }: { params: { matchId: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const chatData = await fetchChatData(params.matchId, user.id);

    if (!chatData) {
        notFound(); // Renders the not-found.tsx page if the chat is inaccessible
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <LoggedInHeader />
            {/* The fetched data is passed down to the interactive client component */}
            <ChatUI
                initialMessages={chatData.initialMessages}
                otherUser={chatData.otherUser}
                currentUser={user}
                matchId={params.matchId}
            />
        </div>
    );
}