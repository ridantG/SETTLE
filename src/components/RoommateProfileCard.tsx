// src/components/RoommateProfileCard.tsx

import Image from 'next/image';
import Link from 'next/link';

type RoommateProfileCardProps = {
  id: string;
  name: string | null; // Allow name to be null
  age: number | null;  // Allow age to be null
  imageUrl: string | null; // Allow imageUrl to be null
};

const RoommateProfileCard = ({ id, name, age, imageUrl }: RoommateProfileCardProps) => {
  return (
    <Link href={`/roommate-results/${id}`} className="block group">
      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 group-hover:shadow-md transition-shadow cursor-pointer">
        <div className="text-left">
          <p className="font-bold text-gray-800">{name || 'Unnamed Profile'}</p>
          <p className="text-sm text-gray-500">{age ? `${age} years` : 'Age not specified'}</p>
        </div>
        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-200">
          {/* CORRECTED IMAGE COMPONENT */}
          <Image 
            // Use a fallback image if the profile has no image_url
            src={imageUrl || '/images/person1.jpg'} 
            // Provide a fallback for the alt text
            alt={name || 'Profile picture'} 
            fill // The modern 'fill' prop
            className="object-cover" // Tailwind class for object-fit
          />
        </div>
      </div>
    </Link>
  );
};

export default RoommateProfileCard;