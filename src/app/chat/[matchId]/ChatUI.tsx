// File: app/chat/[matchId]/ChatUI.tsx
// FINAL, DEFINITIVE, AND COMPLETE VERSION

"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { type MessageWithAuthor, type OtherUser } from './page';
import { type User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import toast, { Toaster } from 'react-hot-toast';
import Link from 'next/link';

type ChatUIProps = {
    initialMessages: MessageWithAuthor[];
    otherUser: OtherUser;
    currentUser: User;
    matchId: string;
};

export default function ChatUI({ initialMessages, otherUser, currentUser, matchId }: ChatUIProps) {
    const supabase = useMemo(() => createClient(), []);
    const [messages, setMessages] = useState(initialMessages);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

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
                    // Fetch the new message with its author's profile
                    const { data: messageWithAuthor } = await supabase
                        .from('messages')
                        .select('*, profiles:sender_id(*)')
                        .eq('id', payload.new.id)
                        .single();

                    if (messageWithAuthor) {
                         setMessages(currentMessages => [...currentMessages, messageWithAuthor as MessageWithAuthor]);
                    }
                }
            )
            .subscribe();
        
        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, matchId]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;

        setIsSending(true);
        const content = newMessage;
        setNewMessage('');

        const response = await fetch(`/api/chat/${matchId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content })
        });

        if (!response.ok) {
            toast.error("Failed to send message.");
            setNewMessage(content); // Restore input on failure
        }
        setIsSending(false);
    };
    
    const handleReportUser = async () => {
        setIsMenuOpen(false);
        const toastId = toast.loading("Submitting report...");
        const response = await fetch('/api/report', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ reported_user_id: otherUser.id }) 
        });
        toast.dismiss(toastId);
        if (response.ok) toast.success("Report submitted. Our team will review it.");
        else toast.error("Failed to submit report.");
    };

    const profileLink = otherUser.role === 'seeker' 
        ? `/roommate-results/${otherUser.id}` 
        : `/seeker-results/${otherUser.id}`;

    return (
        <>
            <Toaster position="top-center" />
            <main className="flex-grow flex flex-col bg-gray-50">
                {/* Chat Header with Menu */}
                <div className="bg-white p-4 border-b border-gray-200 flex items-center justify-between gap-4 sticky top-[72px] z-10">
                    <div className="flex items-center gap-4">
                        <img 
                            src={otherUser.image_url || 'https://placehold.co/40x40'} 
                            alt={otherUser.name || 'Chat partner avatar'} 
                            className="w-10 h-10 rounded-full object-cover" 
                        />
                        <h2 className="font-bold text-lg text-gray-800">{otherUser.name || 'User'}</h2>
                    </div>
                    
                    <div className="relative" ref={menuRef}>
                        <button onClick={() => setIsMenuOpen(prev => !prev)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                        </button>
                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200">
                                <Link href={profileLink} className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={() => setIsMenuOpen(false)}>
                                    View Profile
                                </Link>
                                <button onClick={handleReportUser} className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 font-semibold">
                                    Report User
                                </button>
                            </div>
                        )}
                    </div>
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
                            <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${message.sender_id === currentUser.id ? 'bg-green-500 text-white' : 'bg-white shadow-sm'}`}>
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