// src/app/auth/auth-code-error/page.tsx

import Link from 'next/link';

export default function AuthCodeError() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
      <h1 className="text-3xl font-bold text-red-500 mb-4">Authentication Error</h1>
      <p className="text-gray-600 mb-6">
        Something went wrong during the sign-in process. Please try again.
      </p>
      <Link href="/login">
        <button className="bg-green-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-green-600 transition-colors">
          Return to Login
        </button>
      </Link>
    </div>
  );
}