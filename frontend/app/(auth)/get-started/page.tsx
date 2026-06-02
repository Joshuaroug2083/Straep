'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../hooks/useAuth';
import { Logo } from '../../../components/Logo';
import { PremiumInput } from '../../../components/PremiumInput';
import { PremiumButton } from '../../../components/PremiumButton';
import { Mail, Lock, Eye, EyeOff, UserCheck, ShieldAlert } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register, loading, error: authError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [accountType, setAccountType] = useState<'personal' | 'business' | 'creator'>('personal');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email || !password) {
      setFormError('Please fill in all fields.');
      return;
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }

    try {
      const data = await register(email, password, accountType);
      // Upon successful registration, redirect to OTP verification screen with details
      router.push(`/verify-email?user_id=${data.user_id}&email=${encodeURIComponent(data.email)}`);
    } catch (err: any) {
      // Hook handles storing error
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4 py-12 relative overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-primary-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-accent-500/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-lg z-10">
        {/* Logo Container */}
        <div className="flex flex-col items-center mb-8">
          <Logo size="md" className="mb-2" />
          <p className="text-slate-400 text-sm font-jakarta">Create your brand-first social business hub</p>
        </div>

        {/* Form Panel */}
        <div className="glass-premium rounded-2xl p-8 shadow-2xl relative border border-white/5">
          <h2 className="text-2xl font-bold text-slate-100 font-outfit mb-2 text-center">Get Started Today</h2>
          <p className="text-slate-400 text-sm text-center mb-6 font-jakarta">Join thousands of creators and businesses on Straep</p>

          {(formError || authError) && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-jakarta flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <span>{formError || authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Account Type Selector Grid */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-slate-400 font-outfit uppercase tracking-wider pl-1">
                Select Account Type
              </span>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'personal', label: 'Personal', desc: 'Browse & Follow' },
                  { value: 'business', label: 'Business', desc: 'List Products' },
                  { value: 'creator', label: 'Creator', desc: 'Share & Sell' },
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setAccountType(type.value as any)}
                    className={`
                      p-3 rounded-xl flex flex-col items-center text-center gap-1 border transition-all duration-300 cursor-pointer
                      ${
                        accountType === type.value
                          ? 'border-primary-500 bg-primary-600/15 shadow-inner'
                          : 'border-slate-800/80 bg-slate-900/20 hover:bg-slate-900/40 text-slate-400 hover:text-slate-300'
                      }
                    `}
                  >
                    <span className="text-sm font-bold font-outfit">{type.label}</span>
                    <span className="text-[10px] opacity-75 font-jakarta">{type.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <PremiumInput
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              startIcon={<Mail className="w-4 h-4 text-slate-500" />}
              required
            />

            <PremiumInput
              label="Choose Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 8 characters"
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

            <PremiumButton
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              glow
              className="mt-2 w-full"
            >
              Register & Continue
            </PremiumButton>
          </form>
        </div>

        {/* Footer Link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-400 font-jakarta">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-bold text-primary-400 hover:text-primary-300 transition-colors"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
