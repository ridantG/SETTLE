// File: app/rentals/[id]/page.tsx
// FINAL, UPGRADED VERSION: Now uses the interactive ContactSellerButton.

import { createClient } from '@/lib/supabase/server';
import LoggedInHeader from '@/components/LoggedInHeader';
import { notFound, redirect } from 'next/navigation';
import ContactSellerButton from './ContactSellerButton'; // <-- Import the new button
import { Toaster } from 'react-hot-toast'; // We need this for the button's toasts

async function fetchRental(id: string) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('rentals')
        .select('*, owner:profiles(id, name, image_url)')
        .eq('id', id)
        .single();
    if (error) { console.error("Fetch Rental Error:", error); notFound(); }
    return data;
}

export default async function RentalDetailPage({ params }: { params: { id: string } }) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/');
    
    const rental = await fetchRental(params.id);

    return (
        <div className="min-h-screen bg-gray-100">
            <Toaster position="top-center" />
            <LoggedInHeader />
            <main className="max-w-4xl mx-auto py-12 px-4">
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                    <img src={rental.image_urls[0] || 'https://placehold.co/600x400'} alt={rental.title} className="w-full h-96 object-cover" />
                    <div className="p-8">
                        <p className="text-4xl font-bold text-gray-900">₹{rental.price.toLocaleString()}<span className="text-lg font-normal text-gray-500">/month</span></p>
                        <h1 className="text-3xl font-semibold text-gray-800 mt-2">{rental.title}</h1>
                        <div className="flex justify-between items-center mt-4">
                            <span className="text-sm text-gray-500">{rental.city}</span>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded-full">{rental.category}</span>
                        </div>
                        
                        <div className="mt-8 border-t pt-6">
                            <h2 className="text-xl font-semibold text-gray-800">Description</h2>
                            <p className="text-gray-600 mt-2 whitespace-pre-wrap">{rental.description}</p>
                        </div>

                        <div className="mt-8 border-t pt-6">
                            <h2 className="text-xl font-semibold text-gray-800">Seller Information</h2>
                            <div className="flex items-center gap-4 mt-4">
                                <img src={rental.owner.image_url || 'https://placehold.co/64x64'} alt={rental.owner.name} className="w-16 h-16 rounded-full object-cover" />
                                <div>
                                    <p className="text-lg font-semibold">{rental.owner.name}</p>
                                    {/* THE FIX IS HERE: Replaced <Link> with the intelligent button */}
                                    <ContactSellerButton 
                                        ownerId={rental.owner.id} 
                                        currentUserId={user.id} 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}