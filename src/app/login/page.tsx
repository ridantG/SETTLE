"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FcGoogle } from 'react-icons/fc';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { FaEnvelope, FaLock, FaPhone } from 'react-icons/fa';

export default function LoginPage() {
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [contactInfo, setContactInfo] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Logging in...');

    const options = loginMethod === 'email'
      ? { email: contactInfo, password }
      : { phone: contactInfo, password };

    const { error } = await supabase.auth.signInWithPassword(options);

    toast.dismiss(toastId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Success! Redirecting...');
      window.location.href = '/dashboard';
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => { /* ... Google sign-in logic remains the same ... */ };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 font-sans">
      <div className="flex flex-col items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-extrabold mb-2 text-gray-800">Welcome Back</h1>
          <p className="text-gray-500 mb-8">Log in to continue your journey with Settle.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
              <button type="button" onClick={() => setLoginMethod('email')} className={`py-2 rounded-md font-semibold transition-colors ${loginMethod === 'email' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}>Email</button>
              <button type="button" onClick={() => setLoginMethod('phone')} className={`py-2 rounded-md font-semibold transition-colors ${loginMethod === 'phone' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}>Phone</button>
            </div>

            <div className="relative">
              {loginMethod === 'email' ? <FaEnvelope className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" /> : <FaPhone className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />}
              <input 
                type={loginMethod === 'email' ? 'email' : 'tel'}
                placeholder={loginMethod === 'email' ? 'Email Address' : 'Phone Number (+91...)'}
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                required 
                className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-lg border focus:border-green-500 outline-none"
              />
            </div>
            <div className="relative">
              <FaLock className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-lg border focus:border-green-500 outline-none" />
            </div>
            <button type="submit" disabled={loading} className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition disabled:opacity-50">
              {loading ? 'Logging In...' : 'Log In'}
            </button>
          </form>

          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-sm font-semibold">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <button onClick={handleGoogleSignIn} disabled={loading} className="w-full flex items-center justify-center bg-gray-50 border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-100 transition">
            <FcGoogle className="mr-3 text-2xl" />
            Continue with Google
          </button>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account? <Link href="/signup" className="text-green-600 font-semibold hover:underline">Sign up</Link>
            </p>
          </div>
        </div>
      </div>
      <div 
        className="hidden md:block bg-cover bg-center" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556740738-b6a63e27c4df?q=80&w=1974&auto=format&fit=crop')" }}
      ></div>
    </div>
  );
}