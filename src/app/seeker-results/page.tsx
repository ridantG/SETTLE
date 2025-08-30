// src/app/seeker-results/page.tsx

"use client";

import { useState, useEffect } from "react";
import { createClient } from '@/lib/supabase/client'; 
import LoggedInHeader from "@/components/LoggedInHeader";
import FilterSidebar from "@/components/FilterSidebar";
// We can reuse the same profile card for now
import RoommateProfileCard from "@/components/RoommateProfileCard"; 

type Profile = {
  id: string;
  name: string;
  age: number;
  imageUrl: string;
  gender: string;
  city: string;
  // Add other seeker-specific fields if needed
};

export default function SeekerResultsPage() {
  const supabase = createClient();
  
  const [allSeekers, setAllSeekers] = useState<Profile[]>([]);
  const [displayedSeekers, setDisplayedSeekers] = useState<Profile[]>([]);
  const [filters, setFilters] = useState({
    name: "",
    city: "",
    gender: "All",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSeekers = async () => {
      setIsLoading(true);
      // Fetch only profiles where user_role is 'seeker'
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_role', 'seeker');

      if (error) {
        console.error("Error fetching seekers:", error);
      } else if (data) {
        const validSeekers = data.filter(profile => profile.id != null);
        setAllSeekers(validSeekers);
        setDisplayedSeekers(validSeekers);
      }
      setIsLoading(false);
    };

    fetchSeekers();
  }, [supabase]);

  // Filtering logic remains the same
  useEffect(() => {
    let filtered = allSeekers;
    if (filters.name) {
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(filters.name.toLowerCase()));
    }
    if (filters.city) {
      filtered = filtered.filter((p) => p.city.toLowerCase().includes(filters.city.toLowerCase()));
    }
    if (filters.gender !== "All") {
      filtered = filtered.filter((p) => p.gender === filters.gender);
    }
    setDisplayedSeekers(filtered);
  }, [filters, allSeekers]);

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
          <h2 className="text-2xl font-bold text-gray-800 mb-6">People Looking for a Room</h2>
          {isLoading ? (
            <p className="text-center text-gray-500">Loading profiles...</p>
          ) : displayedSeekers.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {displayedSeekers.map((profile) => (
                <RoommateProfileCard
                  key={profile.id}
                  id={profile.id}
                  name={profile.name}
                  age={profile.age}
                  imageUrl={profile.imageUrl || '/images/person1.jpg'}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 mt-8 text-center">No one is currently looking for a room.</p>
          )}
        </main>
      </div>
    </div>
  );
}