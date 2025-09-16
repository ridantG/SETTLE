"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { FcGoogle } from 'react-icons/fc';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { FaEnvelope, FaLock, FaPhone } from 'react-icons/fa';
import { type Session } from '@supabase/supabase-js';

export default function SignUpPage() {
  const [signUpMethod, setSignUpMethod] = useState<'email' | 'phone'>('email');
  const [contactInfo, setContactInfo] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const supabase = createClient();

  // Step 1: Send the OTP to the user's chosen contact method
  const sendOtp = async () => {
    setLoading(true);
    const toastId = toast.loading('Sending OTP...');
    
    const options = signUpMethod === 'email' 
      ? { email: contactInfo } 
      : { phone: contactInfo };
    
    const { error } = await supabase.auth.signInWithOtp(options);
    
    toast.dismiss(toastId);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('OTP sent successfully!');
      setOtpSent(true);
    }
    setLoading(false);
  };

  // Step 2: Verify the OTP, and if successful, create the account with the password
  const handleFinalSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Verifying and creating account...');

    const options = signUpMethod === 'email'
      ? { email: contactInfo, token: otp, type: 'email' as const }
      : { phone: contactInfo, token: otp, type: 'sms' as const };

    const { data, error: verifyError } = await supabase.auth.verifyOtp(options);

    if (verifyError) {
      toast.dismiss(toastId);
      toast.error(verifyError.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      const { error: updateError } = await supabase.auth.updateUser({ password: password });

      toast.dismiss(toastId);
      if (updateError) {
        toast.error(`Could not set password: ${updateError.message}`);
      } else {
        toast.success('Account created successfully! Redirecting...');
        window.location.href = '/dashboard';
      }
    } else {
        toast.dismiss(toastId);
        toast.error("Could not verify OTP. Please try again.");
    }
    setLoading(false);
  };
  
  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 font-sans">
      <div className="flex flex-col items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl font-extrabold mb-2 text-gray-800">Create Your Account</h1>
          <p className="text-gray-500 mb-8">Secure your account with a password and a verified contact method.</p>
          
          {/* --- UI FOR STEP 1: Enter Details & Send OTP --- */}
          {!otpSent && (
            <form onSubmit={(e) => { e.preventDefault(); sendOtp(); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
                <button type="button" onClick={() => setSignUpMethod('email')} className={`py-2 rounded-md font-semibold transition-colors ${signUpMethod === 'email' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}>Email</button>
                <button type="button" onClick={() => setSignUpMethod('phone')} className={`py-2 rounded-md font-semibold transition-colors ${signUpMethod === 'phone' ? 'bg-white shadow text-green-600' : 'text-gray-500'}`}>Phone</button>
              </div>
              <div className="relative">
                {signUpMethod === 'email' ? <FaEnvelope className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" /> : <FaPhone className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />}
                <input type={signUpMethod === 'email' ? 'email' : 'tel'} placeholder={signUpMethod === 'email' ? 'Email Address' : 'Phone Number (+91...)'} value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} required className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-lg" />
              </div>
              <div className="relative">
                <FaLock className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
                <input type="password" placeholder="Create Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-lg" />
              </div>
              <button type="submit" disabled={loading || !contactInfo || password.length < 6} className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition disabled:opacity-50">
                {loading ? 'Sending...' : 'Send Verification OTP'}
              </button>
            </form>
          )}

          {/* --- UI FOR STEP 2: Verify OTP & Create Account --- */}
          {otpSent && (
            <form onSubmit={handleFinalSignUp} className="space-y-4">
              <p className="text-center text-sm text-gray-600">An OTP has been sent to <span className="font-semibold">{contactInfo}</span>.</p>
              <div className="relative">
                <input type="text" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required minLength={6} className="w-full p-3 bg-gray-50 rounded-lg text-center tracking-widest text-lg" />
              </div>
              <button type="submit" disabled={loading || otp.length < 6} className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition disabled:opacity-50">
                {loading ? 'Verifying...' : 'Verify & Create Account'}
              </button>
            </form>
          )}

          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-400 text-sm font-semibold">OR</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <button onClick={handleGoogleSignIn} disabled={loading} className="w-full flex items-center justify-center bg-gray-50 border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-100 transition">
            <FcGoogle className="mr-3 text-2xl" />
            Sign Up with Google
          </button>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Already have an account? <Link href="/login" className="text-green-600 font-semibold hover:underline">Log in</Link>
            </p>
          </div>
        </div>
      </div>
      <div 
        className="hidden md:block bg-cover bg-center" 
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2158&auto=format&fit=crop')" }}
      ></div>
    </div>
  );
}