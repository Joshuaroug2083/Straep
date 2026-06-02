'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../hooks/useAuth';
import { Logo } from '../../../components/Logo';
import { PremiumInput } from '../../../components/PremiumInput';
import { PremiumButton } from '../../../components/PremiumButton';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error: authError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (!email || !password) {
      setFormError('Please fill in all fields.');
      return;
    }

    try {
      const data = await login(email, password);
      // Based on onboarding_step, redirect to dashboard or onboarding wizard
      if (data.user?.onboarding_done) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    } catch (err: any) {
      // Handled by hook
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4 py-12 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-primary-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-accent-500/10 blur-[100px] pointer-events-none" />
      
      <div className="w-full max-w-md z-10">
        {/* Logo Container */}
        <div className="flex flex-col items-center mb-8">
          <Logo size="md" className="mb-2" />
          <p className="text-slate-400 text-sm font-jakarta">Welcome back to the social storefront</p>
        </div>

        {/* Form Panel */}
        <div className="glass-premium rounded-2xl p-8 shadow-2xl relative border border-white/5">
          <h2 className="text-2xl font-bold text-slate-100 font-outfit mb-6 text-center">Log In to Your Account</h2>
          
          {(formError || authError) && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-jakarta flex items-center">
              <span>{formError || authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <PremiumInput
              label="Email Address"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              startIcon={<Mail className="w-4 h-4 text-slate-500" />}
              required
            />

            <PremiumInput
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              startIcon={<Lock className="w-4 h-4 text-slate-500" />}
              endIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-500 hover:text-slate-300 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              required
            />

            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-primary-400 hover:text-primary-300 transition-colors pl-1"
              >
                Forgot password?
              </Link>
            </div>

            <PremiumButton
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              glow
              className="mt-2 w-full"
            >
              Sign In
            </PremiumButton>
          </form>
        </div>

        {/* Footer Link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-400 font-jakarta">
            Don't have an account?{' '}
            <Link
              href="/get-started"
              className="font-bold text-primary-400 hover:text-primary-300 transition-colors"
            >
              Get Started
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
