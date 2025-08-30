// src/components/ChoiceCard.tsx

import Image from 'next/image';
import Link from 'next/link';

type ChoiceCardProps = {
  imageUrl: string;
  title: string;
  description: string;
  buttonText: string;
  href: string;
};

const ChoiceCard = ({ imageUrl, title, description, buttonText, href }: ChoiceCardProps) => {
  return (
    <Link href={href} className="block group"> 
      <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col md:flex-row items-center w-full transition-shadow group-hover:shadow-lg">
        {/* Image Section */}
        <div className="md:w-1/3 w-full h-52 md:h-full relative">
          {/* CORRECTED IMAGE COMPONENT */}
          <Image 
            src={imageUrl} 
            alt={title} 
            fill // Use the 'fill' prop
            className="object-cover md:rounded-l-xl md:rounded-t-none rounded-t-xl" // Use Tailwind for object-fit
          />
        </div>
        
        {/* Content Section */}
        <div className="p-6 md:w-2/3 flex-grow flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-4 md:mb-0 md:mr-4">
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            <p className="text-gray-600 mt-2">{description}</p>
          </div>
          <div className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg group-hover:bg-green-600 transition-colors whitespace-nowrap">
            {buttonText}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ChoiceCard;