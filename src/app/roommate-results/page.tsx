// src/app/roommate-results/page.tsx

"use client";

import { useState, useEffect } from "react";
import { createClient } from '@/lib/supabase/client'; 
import LoggedInHeader from "@/components/LoggedInHeader";
import FilterSidebar from "@/components/FilterSidebar";
import RoommateProfileCard from "@/components/RoommateProfileCard";

type Profile = {
  id: string;
  name: string | null;
  age: number | null;
  image_url: string | null; // Corrected from imageUrl
  gender: string | null;
  city: string | null;
};

export default function RoommateResultsPage() {
  const supabase = createClient();
  
  const [allRoommates, setAllRoommates] = useState<Profile[]>([]);
  const [displayedRoommates, setDisplayedRoommates] = useState<Profile[]>([]);
  const [filters, setFilters] = useState({
    name: "",
    city: "",
    gender: "All",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      setIsLoading(true);
      
      // THE FIX: Filter for 'lister' profiles only
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_role', 'lister');

      if (error) {
        console.error("Error fetching lister profiles:", error);
      } else if (data) {
        const uniqueAndValidProfiles = Array.from(
          new Map(
            data
              .filter(profile => profile.id != null)
              .map(item => [item.id, item])
          ).values()
        );
        
        setAllRoommates(uniqueAndValidProfiles);
        setDisplayedRoommates(uniqueAndValidProfiles);
      }
      setIsLoading(false);
    };

    fetchProfiles();
  }, [supabase]);

  useEffect(() => {
    let filtered = allRoommates;

    if (filters.name) {
      filtered = filtered.filter((p) => p.name && p.name.toLowerCase().includes(filters.name.toLowerCase()));
    }
    if (filters.city) {
      filtered = filtered.filter((p) => p.city && p.city.toLowerCase().includes(filters.city.toLowerCase()));
    }
    if (filters.gender !== "All") {
      filtered = filtered.filter((p) => p.gender === filters.gender);
    }

    setDisplayedRoommates(filtered);
  }, [filters, allRoommates]);

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <LoggedInHeader />
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 p-4">
        <FilterSidebar filters={filters} onFilterChange={handleFilterChange} />
        <main className="w-full md:w-3/4 lg:w-4/5">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Available Listings</h2>
          {isLoading ? (
            <p className="text-center text-gray-500">Loading listings...</p>
          ) : displayedRoommates.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {displayedRoommates.map((profile) => (
                <RoommateProfileCard
                  key={profile.id}
                  id={profile.id}
                  name={profile.name || 'N/A'}
                  age={profile.age || 0}
                  imageUrl={profile.image_url || '/images/person1.jpg'}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 mt-8 text-center">No listings found matching your criteria.</p>
          )}
        </main>
      </div>
    </div>
  );
}