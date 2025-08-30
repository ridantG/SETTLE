

import Link from 'next/link';

const Header = () => {
  return (
    <header className="w-full bg-white border-b border-gray-200">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-bold text-gray-800">
          <Link href="/dashboard">SETTLE</Link>
        </div>

        {/* Navigation Links for larger screens */}
        <div className="hidden md:flex items-center space-x-8">
          <Link href="#" className="text-gray-600 hover:text-green-500 transition-colors">Find a Room</Link>
          <Link href="#" className="text-gray-600 hover:text-green-500 transition-colors">Find a Roommate</Link>
          <Link href="#" className="text-gray-600 hover:text-green-500 transition-colors">List Your Place</Link>
        </div>

        {/* Login Button */}
        <div>
          <button className="bg-white border-2 border-gray-300 text-gray-700 font-semibold py-2 px-5 rounded-lg hover:bg-gray-50 transition-colors">
            Log in
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;