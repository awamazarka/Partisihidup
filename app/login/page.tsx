'use client';

import { useState } from 'react';
import { User, ShieldCheck, ArrowRight, Loader2, Mail, Lock, UserCircle, Eye, EyeOff } from 'lucide-react';
import { login, signup } from '@/app/auth/actions';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const message = searchParams.get('message');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    // Form submission will be handled by Server Actions
  };

  return (
    <main className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6 pt-32 font-sans">
      <div className="w-full max-w-md bg-white border-[4px] border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] rounded-[2.5rem] p-8 md:p-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-[#FFD600] border-[4px] border-black flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-4">
            <span className="text-3xl font-black italic">AB</span>
          </div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">
            {isSignUp ? 'Create Account' : 'Access Terminal'}
          </h1>
          <p className="font-bold text-xs mt-2 opacity-60 uppercase italic">
            {isSignUp ? 'Join the collectors community' : 'Enter your credentials'}
          </p>
        </div>

        {error && (
          <div className="bg-[#FB923C] border-[3px] border-black p-3 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-xs uppercase italic">
            Error: {error}
          </div>
        )}

        {message && (
          <div className="bg-[#A3E635] border-[3px] border-black p-3 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-xs uppercase italic">
            {message}
          </div>
        )}

        <form action={isSignUp ? signup : login} onSubmit={() => setLoading(true)} className="space-y-5">
          {isSignUp && (
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase italic opacity-60 ml-1">Username</label>
              <div className="relative">
                <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
                <input
                  name="username"
                  type="text"
                  placeholder="USERNAME"
                  required
                  className="w-full bg-white border-[3px] border-black p-4 pl-12 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all outline-none"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-black uppercase italic opacity-60 ml-1">
              {isSignUp ? 'Email Address' : 'Email or Username'}
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
              <input
                name={isSignUp ? "email" : "identity"}
                type={isSignUp ? "email" : "text"}
                placeholder={isSignUp ? "EMAIL@EXAMPLE.COM" : "EMAIL / USERNAME"}
                required
                className="w-full bg-white border-[3px] border-black p-4 pl-12 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all outline-none text-black"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-black uppercase italic opacity-60 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                className="w-full bg-white border-[3px] border-black p-4 pl-12 pr-12 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all outline-none text-black"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100 transition-opacity"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-[#FFD600] border-[4px] border-black p-4 flex items-center justify-center gap-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all disabled:opacity-50 group mt-4"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <span className="font-black uppercase italic text-lg">{isSignUp ? 'Sign Up' : 'Login Now'}</span>
                <ArrowRight className="group-hover:translate-x-2 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t-[3px] border-black flex flex-col items-center gap-4">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[10px] font-black uppercase italic hover:underline underline-offset-4 decoration-2"
          >
            {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
          </button>
          
          <div className="flex items-center gap-2 opacity-30">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[8px] font-black uppercase italic">Secured by Supabase & AB Terminal</span>
          </div>
        </div>

        {/* Hint for admin login */}
        {!isSignUp && (
            <div className="mt-6 p-3 bg-zinc-100 border-[2px] border-black border-dashed rounded-lg">
                <p className="text-[9px] font-bold uppercase opacity-50 text-center italic">
                    Hint: Admin access uses 'admin' as username
                </p>
            </div>
        )}
      </div>
    </main>
  );
}
