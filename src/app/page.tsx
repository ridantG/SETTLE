// src/app/page.tsx

import Link from 'next/link';
import { FaHome, FaUsers, FaComments } from 'react-icons/fa';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans">
      {/* Header */}
      <header className="absolute top-0 left-0 w-full z-10">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-3xl font-extrabold text-gray-900">
            Settle
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="font-semibold text-gray-700 hover:text-green-600 transition-colors">
              Log In
            </Link>
            <Link href="/signup" className="bg-green-500 text-white font-bold py-2 px-5 rounded-full hover:bg-green-600 transition-transform hover:scale-105 shadow-sm">
              Sign Up
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center text-center bg-gray-50 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-white to-green-50 opacity-80"></div>
          <div className="relative z-10 px-4 fade-in">
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight">
              Find Your Perfect <span className="text-green-600">Settle</span>ment.
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
              Whether you&apos;re looking for a room or a roommate, Settle makes finding your next home simple, safe, and seamless.
            </p>
            <Link href="/signup" className="mt-8 inline-block bg-green-500 text-white font-bold py-4 px-8 rounded-full text-lg hover:bg-green-600 transition-transform hover:scale-105 shadow-lg">
              Get Started
            </Link>
          </div>
        </section>

        {/* About Us Section */}
        <section id="about" className="py-24 bg-white">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-extrabold text-gray-900">About Settle</h2>
            <p className="mt-4 text-lg text-gray-600 leading-relaxed">
              Finding the right place to live and the right people to live with can be one of life&apos;s biggest challenges. Settle was born from this very challenge. Our mission is to simplify the process of finding a home and compatible roommates by creating a trusted, community-driven platform.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-extrabold text-gray-900">Everything You Need</h2>
              <p className="mt-2 text-lg text-gray-600">All the tools to find your next home.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 fade-in-stagger">
              <div className="text-center p-8 bg-white rounded-xl shadow-md transition-all hover:shadow-2xl hover:-translate-y-2" style={{'--stagger-index': 1} as React.CSSProperties}>
                <FaHome className="mx-auto text-5xl text-green-500 mb-4" />
                <h3 className="text-2xl font-bold">Find a Room</h3>
                <p className="mt-2 text-gray-600">Search through listings to find the perfect room that fits your budget and lifestyle.</p>
              </div>
              <div className="text-center p-8 bg-white rounded-xl shadow-md transition-all hover:shadow-2xl hover:-translate-y-2" style={{'--stagger-index': 2} as React.CSSProperties}>
                <FaUsers className="mx-auto text-5xl text-green-500 mb-4" />
                <h3 className="text-2xl font-bold">Find a Roommate</h3>
                <p className="mt-2 text-gray-600">Connect with potential roommates who share your interests, habits, and values.</p>
              </div>
              <div className="text-center p-8 bg-white rounded-xl shadow-md transition-all hover:shadow-2xl hover:-translate-y-2" style={{'--stagger-index': 3} as React.CSSProperties}>
                <FaComments className="mx-auto text-5xl text-green-500 mb-4" />
                <h3 className="text-2xl font-bold">Community Forum</h3>
                <p className="mt-2 text-gray-600">Join discussions, ask questions, and get advice from the Settle community.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p>&copy; {new Date().getFullYear()} Settle. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}