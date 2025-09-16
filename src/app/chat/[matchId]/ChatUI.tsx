// File: app/chat/[matchId]/ChatUI.tsx
// FINAL, OPTIMIZED VERSION: The Supabase client is now correctly memoized for performance.

"use client";

import { useState, useEffect, useRef, useMemo } from 'react'; // 1. Import useMemo
import { type MessageWithAuthor } from './page';
import { type User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import toast, { Toaster } from 'react-hot-toast';

type ChatUIProps = {
    initialMessages: MessageWithAuthor[];
    otherUser: { name: string | null; image_url: string | null; };
    currentUser: User;
    matchId: string;
};

export default function ChatUI({ initialMessages, otherUser, currentUser, matchId }: ChatUIProps) {
    // 2. THE FIX IS HERE: The Supabase client instance is now memoized.
    const supabase = useMemo(() => createClient(), []);
    
    const [messages, setMessages] = useState(initialMessages);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const channel = supabase
            .channel(`realtime-chat:${matchId}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${matchId}` },
                async (payload) => {
                    const { data: messageWithAuthor, error } = await supabase
                        .from('messages')
                        .select('*, profiles:sender_id(*)')
                        .eq('id', payload.new.id)
                        .single();

                    if (!error && messageWithAuthor) {
                         setMessages(currentMessages => [...currentMessages, messageWithAuthor as MessageWithAuthor]);
                    }
                }
            )
            .subscribe();
        
        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, matchId]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;

        setIsSending(true);
        const content = newMessage;
        setNewMessage('');

        const response = await fetch(`/api/chat/${matchId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: content })
        });

        if (!response.ok) {
            toast.error("Failed to send message.");
            setNewMessage(content);
        }
        setIsSending(false);
    };

    return (
        <>
            <Toaster position="top-center" />
            <main className="flex-grow flex flex-col">
                {/* Chat Header */}
                <div className="bg-white p-4 border-b border-gray-200 flex items-center gap-4 sticky top-0">
                    <img 
                        src={otherUser.image_url || 'https://placehold.co/40x40'} 
                        alt={otherUser.name || 'Chat partner avatar'} 
                        className="w-10 h-10 rounded-full object-cover" 
                    />
                    <h2 className="font-bold text-lg text-gray-800">{otherUser.name || 'User'}</h2>
                </div>

                {/* Messages Area */}
                <div className="flex-grow p-6 overflow-y-auto space-y-4">
                    {messages.map(message => (
                        <div key={message.id} className={`flex items-end gap-3 ${message.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                            {message.sender_id !== currentUser.id && (
                                <img 
                                    src={message.profiles?.image_url || 'https://placehold.co/32x32'} 
                                    alt={message.profiles?.name || 'User avatar'} 
                                    className="w-8 h-8 rounded-full object-cover" 
                                />
                            )}
                            <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${message.sender_id === currentUser.id ? 'bg-green-500 text-white' : 'bg-white'}`}>
                                <p className="text-sm">{message.content}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                
                {/* Message Input Form */}
                <div className="bg-white p-4 border-t border-gray-200 sticky bottom-0">
                    <form onSubmit={handleSendMessage} className="flex gap-4">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-grow p-3 border border-gray-300 rounded-full"
                            disabled={isSending}
                        />
                        <button type="submit" className="bg-green-500 text-white font-semibold px-6 py-3 rounded-full hover:bg-green-600 disabled:bg-gray-400" disabled={isSending}>
                            Send
                        </button>
                    </form>
                </div>
            </main>
        </>
    );
}