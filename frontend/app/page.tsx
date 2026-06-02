'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../hooks/useAuth';
import { Logo } from '../components/Logo';
import { PremiumButton } from '../components/PremiumButton';
import { 
  ArrowRight, 
  Globe, 
  ShoppingBag, 
  MessageCircle, 
  ChevronRight, 
  Sparkles,
  Zap,
  TrendingUp,
  Fingerprint
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // If already logged in, redirect straight to feed
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/home');
    }
  }, [isAuthenticated, router]);

  const features = [
    {
      title: 'Social Brand Pages',
      desc: 'Build customizable, section-based public profiles tailored to your brand style.',
      icon: <Globe className="w-6 h-6 text-indigo-400" />,
      color: 'from-indigo-500/10 to-blue-500/5',
      borderColor: 'border-indigo-500/20',
    },
    {
      title: 'Integrated Storefronts',
      desc: 'List products and booking services directly on your profile page with NGN pricing.',
      icon: <ShoppingBag className="w-6 h-6 text-cyan-400" />,
      color: 'from-cyan-500/10 to-teal-500/5',
      borderColor: 'border-cyan-500/20',
    },
    {
      title: 'Leads Management',
      desc: 'Collect customer inquiry forms instantly into a gated pipeline inbox with notes.',
      icon: <MessageCircle className="w-6 h-6 text-emerald-400" />,
      color: 'from-emerald-500/10 to-teal-500/5',
      borderColor: 'border-emerald-500/20',
    },
  ];

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 font-jakarta overflow-x-hidden relative">
      
      {/* Background visual glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[550px] h-[550px] rounded-full bg-primary-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[550px] h-[550px] rounded-full bg-accent-500/10 blur-[130px] pointer-events-none" />
      
      {/* Navigation Header */}
      <nav className="max-w-6xl mx-auto px-4 py-5 flex justify-between items-center z-10 relative">
        <Logo size="sm" />
        <div className="flex gap-4">
          <Link href="/login">
            <PremiumButton variant="ghost" size="sm">
              Log In
            </PremiumButton>
          </Link>
          <Link href="/get-started">
            <PremiumButton variant="primary" size="sm" glow>
              Get Started
            </PremiumButton>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-20 md:pt-28 md:pb-32 text-center z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-6"
        >
          {/* Badge */}
          <div className="px-4 py-1.5 rounded-full glass border border-white/10 text-xs font-bold text-slate-300 flex items-center gap-2 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-primary-400 animate-pulse" /> Introducing Straep Phase 1 MVP
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black font-outfit tracking-tight max-w-4xl leading-[1.1] text-slate-100">
            Build your brand.
            <br />
            <span className="animated-gradient-text">Showcase your market.</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed font-jakarta">
            The social storefront that combines customisable profile pages, product catalogs, lead inboxes, and a chronological social updates feed.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-xs sm:max-w-none mt-4">
            <Link href="/get-started">
              <PremiumButton variant="primary" size="lg" glow className="w-full sm:w-auto px-8 flex items-center gap-2 justify-center">
                Launch Your Showroom <ArrowRight className="w-5 h-5" />
              </PremiumButton>
            </Link>
            <Link href="/discover">
              <PremiumButton variant="glass" size="lg" className="w-full sm:w-auto px-8 flex items-center gap-2 justify-center">
                Explore Discover Showcase <ChevronRight className="w-5 h-5" />
              </PremiumButton>
            </Link>
          </div>
        </motion.div>

        {/* Floating preview mock illustration */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-20 max-w-4xl mx-auto rounded-2xl border border-white/5 bg-slate-950/60 p-4 shadow-2xl shadow-primary-500/5 relative overflow-hidden"
        >
          {/* Top Title bar decoration */}
          <div className="flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500/20" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/20" />
            <span className="text-[10px] text-slate-600 font-mono select-none pl-2">straep.com/p/stitchtailors</span>
          </div>
          
          <div className="aspect-[16/9] w-full rounded-lg bg-gradient-to-tr from-slate-900 to-slate-950/40 relative flex items-center justify-center border border-white/5 overflow-hidden">
            <div className="flex flex-col items-center gap-4 text-center max-w-sm px-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center font-bold text-white text-xl">
                S
              </div>
              <h3 className="text-xl font-bold font-outfit text-slate-100">Stitch Bespoke Tailors</h3>
              <p className="text-xs text-slate-400 font-jakarta leading-relaxed">
                Premium custom suit configurations and artisanal patterns. Browse catalog tabs or submit a query.
              </p>
              <div className="flex gap-2 w-full mt-2">
                <div className="flex-1 py-2 rounded-xl bg-primary-600 text-white font-bold text-xs uppercase shadow-lg shadow-primary-500/20">
                  Products
                </div>
                <div className="flex-1 py-2 rounded-xl bg-slate-900 border border-white/5 text-slate-400 font-bold text-xs uppercase">
                  Inquire
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 border-t border-white/5 z-10 relative">
        <h2 className="text-2xl md:text-3xl font-extrabold font-outfit text-slate-100 mb-12 text-center">
          Supercharged Features Built for Growth
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <div
              key={i}
              className={`p-6 rounded-2xl bg-gradient-to-br ${feat.color} border ${feat.borderColor} text-left flex flex-col justify-between gap-6 shadow-md hover:shadow-lg transition-all duration-300 h-full`}
            >
              <div className="flex flex-col gap-4">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-white/5 w-fit flex items-center justify-center">
                  {feat.icon}
                </div>
                <div>
                  <h3 className="font-bold text-slate-200 font-outfit text-lg mb-2">{feat.title}</h3>
                  <p className="text-xs text-slate-400 font-jakarta leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-slate-950 border-t border-white/5 mt-12 py-12 relative z-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <Logo size="sm" />
          <p className="text-xs text-slate-600 font-jakarta">
            &copy; {new Date().getFullYear()} Straep Social Business Platform. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
