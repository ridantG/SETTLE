// File: app/rentals/RentalsClient.tsx
"use client";

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import EmptyState from '@/components/EmptyState';

// A new, dedicated card for rental listings
const RentalCard = ({ rental }: { rental: any }) => (
    <Link href={`/rentals/${rental.id}`} className="block">
        <div className="bg-white rounded-lg shadow-md overflow-hidden group transition-transform duration-300 hover:scale-105">
            <img 
                src={rental.image_urls[0] || 'https://placehold.co/300x200'} 
                alt={rental.title} 
                className="w-full h-48 object-cover" 
            />
            <div className="p-4">
                <p className="text-xl font-bold text-gray-900">₹{rental.price.toLocaleString()}<span className="text-sm font-normal text-gray-500">/month</span></p>
                <h3 className="text-lg font-semibold text-gray-800 truncate mt-1">{rental.title}</h3>
                <p className="text-sm text-gray-500">{rental.city}</p>
            </div>
        </div>
    </Link>
);

export default function RentalsClient({ initialRentals }: { initialRentals: any[] }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams);
        if (searchTerm) params.set('q', searchTerm);
        else params.delete('q');
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800">Rent Everything</h1>
                <Link href="/rentals/new" className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600">
                    + Post an Ad
                </Link>
            </div>
            <form onSubmit={handleSearch} className="mb-8 flex gap-2">
                <input 
                    type="text" 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    placeholder="Search for anything..." 
                    className="w-full p-3 border rounded-lg"
                />
                <button type="submit" className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg">Search</button>
            </form>

            {initialRentals.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {initialRentals.map(rental => (
                        <RentalCard key={rental.id} rental={rental} />
                    ))}
                </div>
            ) : (
                <EmptyState title="No Listings Found" message="No items match your search. Why not be the first to post something?" actionText="Post an Ad" actionHref="/rentals/new" />
            )}
        </>
    );
}