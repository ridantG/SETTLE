// File: src/components/ChoiceCard.tsx
// A reusable, professional component for displaying user choices on the dashboard.

"use client";

import React from 'react';

// Define the props this component will accept
type ChoiceCardProps = {
    title: string;
    description: string;
    icon: React.ReactNode; // Allows passing SVG components as props
    onClick: () => void;
    colorTheme: 'green' | 'blue'; // To control the hover effect color
};

export default function ChoiceCard({ title, description, icon, onClick, colorTheme }: ChoiceCardProps) {
    const hoverColorClass = colorTheme === 'green' ? 'hover:border-green-500' : 'hover:border-blue-500';
    const groupHoverTextColorClass = colorTheme === 'green' ? 'group-hover:text-green-600' : 'group-hover:text-blue-600';

    return (
        <div 
            onClick={onClick}
            className={`p-8 rounded-xl shadow-lg border-2 border-gray-200 ${hoverColorClass} hover:shadow-2xl hover:scale-105 cursor-pointer transition-all duration-300 group`}
        >
            {icon}
            <h2 className={`text-2xl font-bold text-gray-900 ${groupHoverTextColorClass} transition-colors`}>
                {title}
            </h2>
            <p className="mt-2 text-gray-500">
                {description}
            </p>
        </div>
    );
}