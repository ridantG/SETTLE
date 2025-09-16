"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { FaEnvelope } from 'react-icons/fa';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const supabase = createClient();

  const handlePasswordReset = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Sending reset instructions...');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/reset-password`,
    });

    toast.dismiss(toastId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password reset link has been sent to your email.');
      setEmailSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 font-sans">
      <div className="flex flex-col items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-extrabold mb-2 text-gray-800">Forgot Your Password?</h1>
          <p className="text-gray-500 mb-8">No problem. Enter your email and we&apos;ll send you instructions to reset it.</p>
          
          {!emailSent ? (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="relative">
                <FaEnvelope className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-lg" />
              </div>
              <button type="submit" disabled={loading} className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="font-semibold text-green-700">Instructions have been sent to <span className="font-bold">{email}</span>. Please check your inbox.</p>
            </div>
          )}
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Remembered your password? <Link href="/login" className="text-green-600 font-semibold hover:underline">Log in</Link>
            </p>
          </div>
        </div>
      </div>
      <div 
        className="hidden md:block bg-cover bg-center" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1555952494-035b8287754b?q=80&w=2070&auto=format&fit=crop')" }}
      ></div>
    </div>
  );
}