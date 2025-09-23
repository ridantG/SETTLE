// File: src/components/filtersidebar.tsx
// FINAL, CORRECTED VERSION: This component now updates the URL search parameters on submit.

"use client";

import React, { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export default function FilterSidebar({ isSeekerPage = false }: { isSeekerPage?: boolean; }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Initialize state from URL search params to persist selections on reload
    const [filters, setFilters] = useState({
        city: searchParams.get('city') || '',
        maxBudget: searchParams.get('maxBudget') || '50000',
        drinks: searchParams.get('drinks') || '',
        smokes: searchParams.get('smokes') || '',
        diet: searchParams.get('diet') || '',
        has_pets: searchParams.get('has_pets') || '',
        sortBy: searchParams.get('sortBy') || 'created_at',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };

    const handleToggle = (key: 'drinks' | 'smokes' | 'has_pets', value: string) => {
        setFilters(prev => ({ ...prev, [key]: prev[key as keyof typeof prev] === value ? '' : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        // Build the query string from the filter state
        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                params.set(key, value);
            }
        });
        // This updates the URL, which triggers Next.js to re-render the Server Component (page.tsx)
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <aside className="w-full lg:w-1/4 xl:w-1/5">
            <div className="bg-white p-6 rounded-2xl shadow-lg sticky top-28">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Filters</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">Location (City)</label>
                        <input type="text" id="city" value={filters.city} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" placeholder="e.g., Mumbai" />
                    </div>

                    {isSeekerPage && (
                        <div>
                            <label htmlFor="maxBudget" className="block text-sm font-medium text-gray-700 mb-1">Max Budget (₹{Number(filters.maxBudget).toLocaleString()})</label>
                            <input type="range" id="maxBudget" min="5000" max="100000" step="1000" value={filters.maxBudget} onChange={handleChange} className="w-full" />
                        </div>
                    )}
                    
                    <div>
                        <label htmlFor="diet" className="block text-sm font-medium text-gray-700 mb-1">Dietary Preference</label>
                        <select id="diet" value={filters.diet} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md bg-white">
                            <option value="">Any</option>
                            <option value="Vegetarian">Vegetarian</option>
                            <option value="Non-Vegetarian">Non-Vegetarian</option>
                            <option value="Flexible">Flexible</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Dealbreakers</label>
                        <div className="space-y-2">
                            <button type="button" onClick={() => handleToggle('drinks', 'false')} className={`w-full text-left px-3 py-2 text-sm rounded-md border ${filters.drinks === 'false' ? 'bg-red-100 text-red-800 border-red-300' : 'bg-gray-50'}`}>Must be Non-Drinker</button>
                            <button type="button" onClick={() => handleToggle('smokes', 'false')} className={`w-full text-left px-3 py-2 text-sm rounded-md border ${filters.smokes === 'false' ? 'bg-red-100 text-red-800 border-red-300' : 'bg-gray-50'}`}>Must be Non-Smoker</button>
                            <button type="button" onClick={() => handleToggle('has_pets', 'false')} className={`w-full text-left px-3 py-2 text-sm rounded-md border ${filters.has_pets === 'false' ? 'bg-red-100 text-red-800 border-red-300' : 'bg-gray-50'}`}>Must be Pet-Free</button>
                        </div>
                    </div>
                    
                    <button type="submit" className="w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-green-600 h-10">
                        Search
                    </button>
                </form>
            </div>
        </aside>
    );
}