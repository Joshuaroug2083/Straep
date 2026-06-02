'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { Logo } from '../../../components/Logo';
import { PremiumButton } from '../../../components/PremiumButton';
import { ShieldCheck, MailOpen, AlertTriangle } from 'lucide-react';

export function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyOtp, loading, error: authError } = useAuth();

  const userId = searchParams.get('user_id');
  const email = searchParams.get('email') || '';

  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [formError, setFormError] = useState<string | null>(null);
  
  // Refs for each input box for auto-focus forwarding/backwards
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Auto redirect if search params are missing
  useEffect(() => {
    if (!userId) {
      setFormError('Missing verification details. Redirecting to registration...');
      const timer = setTimeout(() => {
        router.push('/get-started');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [userId, router]);

  const handleChange = (index: number, value: string) => {
    // Only accept numeric inputs
    if (value && !/^\d+$/.test(value)) return;

    const newCode = [...otpCode];
    // Keep only last char if pasted/typed multiple
    newCode[index] = value.substring(value.length - 1);
    setOtpCode(newCode);

    // Auto-focus next input box
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Auto backspace navigation
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pastedData)) return;

    const digits = pastedData.split('');
    setOtpCode(digits);
    // Focus last digit
    inputRefs[5].current?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const codeString = otpCode.join('');
    if (codeString.length < 6 || !userId) {
      setFormError('Please enter the full 6-digit verification code.');
      return;
    }

    try {
      await verifyOtp(userId, codeString, 'email');
      // On verification success, user state is updated. Redirect to onboarding step 1.
      router.push('/onboarding');
    } catch (err) {
      // Error handled by hook
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4 py-12 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-primary-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-accent-500/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Logo size="md" className="mb-2" />
          <p className="text-slate-400 text-sm font-jakarta">Verify your access</p>
        </div>

        {/* Card */}
        <div className="glass-premium rounded-2xl p-8 shadow-2xl relative border border-white/5">
          <div className="w-12 h-12 rounded-full bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mx-auto mb-6">
            <MailOpen className="w-6 h-6 text-primary-400" />
          </div>

          <h2 className="text-2xl font-bold text-slate-100 font-outfit mb-2 text-center">Confirm Your Email</h2>
          <p className="text-slate-400 text-sm text-center mb-6 font-jakarta">
            We've sent a 6-digit verification code to <span className="text-slate-200 font-semibold">{email}</span>. Please print/check your backend console terminal logs.
          </p>

          {(formError || authError) && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-jakarta flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{formError || authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Input boxes grid */}
            <div className="flex justify-between gap-2">
              {otpCode.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-12 h-14 bg-slate-900/60 border border-slate-800/80 focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20 text-center text-xl font-bold rounded-xl text-slate-100 focus:outline-none transition-all duration-300 font-outfit"
                />
              ))}
            </div>

            <PremiumButton
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              glow
              className="w-full"
            >
              Verify Code
            </PremiumButton>

            <div className="text-center mt-2">
              <span className="text-xs text-slate-500 font-jakarta">
                Didn't receive the code?{' '}
                <button
                  type="button"
                  className="font-bold text-primary-400 hover:text-primary-300 transition-colors bg-transparent border-none cursor-pointer"
                  onClick={() => alert("OTP printed to Django backend terminal. Please inspect console log.")}
                >
                  Resend OTP
                </button>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
