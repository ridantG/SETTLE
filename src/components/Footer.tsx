// File: src/components/Footer.tsx
// FINAL VERSION: The text logo has been replaced with your official image logo.

"use client";

import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-20 py-0 px-4 sm:px-6 lg:px-10 h-2">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Company</h3>
                        <ul className="mt-4 space-y-4">
                            <li><Link href="/about" className="text-base text-gray-500 hover:text-gray-900">About</Link></li>
                            <li><Link href="/contact" className="text-base text-gray-500 hover:text-gray-900">Contact</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
                        <ul className="mt-4 space-y-4">
                            <li><Link href="/privacy" className="text-base text-gray-500 hover:text-gray-900">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="text-base text-gray-500 hover:text-gray-900">Terms of Service</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Safety</h3>
                        <ul className="mt-4 space-y-4">
                            <li><Link href="/safety" className="text-base text-gray-500 hover:text-gray-900">Safety Center</Link></li>
                            <li><Link href="/guidelines" className="text-base text-gray-500 hover:text-gray-900">Community Guidelines</Link></li>
                        </ul>
                    </div>
                    
                    {/* THE FIX IS HERE: The text div is replaced with your image logo. */}
                    <div className="flex justify-center md:justify-end">
                        <Link href="/dashboard">
                            <img 
                                src="/logo.png" // This path works because the image is in the 'public' folder.
                                alt="Settle Logo" 
                                className="h-60 " // Adjust height as needed
                            />
                        </Link>
                    </div>
                </div>
                <div className="mt-12 border-t border-gray-200 pt-8">
                    <p className="text-base text-gray-400 text-center">&copy; {new Date().getFullYear()} Settle, Inc. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}