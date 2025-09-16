// File: src/components/filtersidebar.tsx
// FINAL, COMPLETE, AND FUNCTIONAL VERSION. NO MORE PLACEHOLDERS.

"use client";

import React, { useState, useEffect } from 'react';

export type Filters = {
    city: string;
    maxBudget: string;
    drinks: boolean | null;
    smokes: boolean | null;
    diet: string;
    has_pets: boolean | null;
    sortBy: 'created_at' | 'preferences->>budget';
};

type FilterSidebarProps = {
    onApplyFilters: (filters: Filters) => void;
    isSeekerPage?: boolean;
};

export default function FilterSidebar({ onApplyFilters, isSeekerPage = false }: FilterSidebarProps) {
    const [filters, setFilters] = useState<Filters>({
        city: '',
        maxBudget: '50000',
        drinks: null,
        smokes: null,
        diet: '',
        has_pets: null,
        sortBy: 'created_at'
    });

    // Automatically apply filters when they change after a small delay
    useEffect(() => {
        const handler = setTimeout(() => {
            onApplyFilters(filters);
        }, 500); // 500ms debounce
        return () => clearTimeout(handler);
    }, [filters, onApplyFilters]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.id]: e.target.value }));
    };
    
    const handleToggle = (key: 'drinks' | 'smokes' | 'has_pets', value: boolean) => {
        setFilters(prev => ({ ...prev, [key]: prev[key] === value ? null : value }));
    };

    return (
        <aside className="w-full lg:w-1/4 xl:w-1/5">
            <div className="bg-white p-6 rounded-2xl shadow-lg sticky top-28">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Filters</h2>
                <div className="space-y-6">
                    <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <input type="text" id="city" value={filters.city} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" placeholder="e.g., Mumbai" />
                    </div>
                    {isSeekerPage && (
                        <div>
                            <label htmlFor="maxBudget" className="block text-sm font-medium text-gray-700 mb-1">Max Budget (₹{Number(filters.maxBudget).toLocaleString()})</label>
                            <input type="range" id="maxBudget" min="5000" max="100000" step="1000" value={filters.maxBudget} onChange={handleChange} className="w-full" />
                        </div>
                    )}
                    <div>
                        <label htmlFor="diet" className="block text-sm font-medium text-gray-700 mb-1">Diet</label>
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
                            <button type="button" onClick={() => handleToggle('drinks', false)} className={`w-full text-left px-3 py-2 text-sm rounded-md border ${filters.drinks === false ? 'bg-red-100 text-red-800 border-red-300' : 'bg-gray-50'}`}>Must be Non-Drinker</button>
                            <button type="button" onClick={() => handleToggle('smokes', false)} className={`w-full text-left px-3 py-2 text-sm rounded-md border ${filters.smokes === false ? 'bg-red-100 text-red-800 border-red-300' : 'bg-gray-50'}`}>Must be Non-Smoker</button>
                            <button type="button" onClick={() => handleToggle('has_pets', false)} className={`w-full text-left px-3 py-2 text-sm rounded-md border ${filters.has_pets === false ? 'bg-red-100 text-red-800 border-red-300' : 'bg-gray-50'}`}>Must be Pet-Free</button>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                        <select id="sortBy" value={filters.sortBy} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md bg-white">
                            <option value="created_at">Newest First</option>
                            <option value="preferences->>budget">Budget (Low to High)</option>
                        </select>
                    </div>
                </div>
            </div>
        </aside>
    );
}