// File: app/tiffin/page.tsx
// CORRECTED: The duplicate <Footer /> component has been removed.

import LoggedInHeader from '@/components/LoggedInHeader';
// The Footer import is no longer needed here.

const TiffinPageIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-24 w-24 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4V2" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 4V2.5" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 4V2.5" />
    </svg>
);

export default function TiffinServicePage() {
    return (
        // The main div no longer needs flex-col, as the layout handles it.
        <div className="bg-gray-50">
            <LoggedInHeader />
            <main className="flex items-center justify-center py-24">
                <div className="text-center bg-white p-12 rounded-2xl shadow-2xl max-w-2xl mx-auto">
                    <TiffinPageIcon />
                    <h1 className="mt-8 text-5xl font-extrabold text-gray-900">
                        <span className="text-green-600">Settle</span> Tiffin Service
                    </h1>
                    <p className="mt-4 text-2xl font-semibold text-gray-700">
                        Coming Soon!
                    </p>
                    <p className="mt-6 text-lg text-gray-500 max-w-lg mx-auto">
                        Delicious, home-cooked meals delivered right to your doorstep. The perfect way to truly <span className="italic">settle</span> in without the hassle of cooking.
                    </p>
                    <p className="mt-4 font-semibold text-gray-600">
                        Stay connected for updates!
                    </p>
                </div>
            </main>
            {/* The duplicate <Footer /> is now removed from this page. */}
        </div>
    );
}