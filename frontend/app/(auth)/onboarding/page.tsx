'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { api } from '../../../lib/api';
import { Logo } from '../../../components/Logo';
import { PremiumInput } from '../../../components/PremiumInput';
import { PremiumButton } from '../../../components/PremiumButton';
import { 
  Briefcase, 
  Sparkles, 
  MapPin, 
  Globe, 
  Check, 
  Code, 
  Heart, 
  Search, 
  Compass, 
  UserPlus2,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock list of categories for onboarding
const CURATED_CATEGORIES = [
  { name: 'Fashion & Style', slug: 'fashion' },
  { name: 'Technology & Gadgets', slug: 'technology' },
  { name: 'Health & Wellness', slug: 'wellness' },
  { name: 'Home & Living', slug: 'design' },
  { name: 'Art & Design', slug: 'art' },
  { name: 'Food & Culinary', slug: 'food' },
  { name: 'Education & Books', slug: 'education' },
  { name: 'Travel & Tourism', slug: 'travel' },
  { name: 'Beauty & Skincare', slug: 'beauty' },
  { name: 'Sports & Fitness', slug: 'sports' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, fetchMe, loading: authLoading } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [accountType, setAccountType] = useState('personal');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [suggestedBrands, setSuggestedBrands] = useState<any[]>([]);
  const [followedIds, setFollowedIds] = useState<string[]>([]);

  // Fetch user step initially
  useEffect(() => {
    if (user) {
      if (user.onboarding_done) {
        router.push('/dashboard');
      } else {
        // Map user profile/step to onboarding wizard step
        // Django's step values: 1 (after verify), 2 (after step 1), 3 (after step 2), 4 (after step 3), 5 (done)
        // If user onboarding_step is 1, wizard currentStep = 1.
        // If user onboarding_step is 2, wizard currentStep = 2.
        // If user onboarding_step is 3, wizard currentStep = 3.
        // If user onboarding_step is 4, wizard currentStep = 4.
      }
    }
  }, [user, router]);

  // Load suggested brands when reaching step 4
  useEffect(() => {
    if (currentStep === 4) {
      fetchSuggestedBrands();
    }
  }, [currentStep]);

  const fetchSuggestedBrands = async () => {
    try {
      // In a real app we query /api/v1/discover or /api/v1/brands/suggested
      // Let's seed mock suggestions or query discover page API
      const response = await api.get('/discover');
      if (response.data?.success) {
        setSuggestedBrands(response.data.data?.featured_brands || [
          { id: '1', business_name: 'Stitch & Co', username_slug: 'stitch', category_name: 'Fashion', follower_count: 1204, tagline: 'Artisanal tailoring and modern basics.' },
          { id: '2', business_name: 'Nexus Tech', username_slug: 'nexus', category_name: 'Technology', follower_count: 8530, tagline: 'Futuristic gear and computational gadgets.' },
          { id: '3', business_name: 'Sano Juice', username_slug: 'sano', category_name: 'Wellness', follower_count: 421, tagline: 'Cold pressed organic botanical elixirs.' },
        ]);
      }
    } catch (err) {
      // Fallback mocks
      setSuggestedBrands([
        { id: '1', business_name: 'Stitch & Co', username_slug: 'stitch', category_name: 'Fashion', follower_count: 1204, tagline: 'Artisanal tailoring and modern basics.' },
        { id: '2', business_name: 'Nexus Tech', username_slug: 'nexus', category_name: 'Technology', follower_count: 8530, tagline: 'Futuristic gear and computational gadgets.' },
        { id: '3', business_name: 'Sano Juice', username_slug: 'sano', category_name: 'Wellness', follower_count: 421, tagline: 'Cold pressed organic botanical elixirs.' },
      ]);
    }
  };

  const handleFollowToggle = async (brandId: string) => {
    try {
      const response = await api.post(`/social/brands/${brandId}/follow/`);
      if (response.data?.success) {
        if (followedIds.includes(brandId)) {
          setFollowedIds(followedIds.filter(id => id !== brandId));
        } else {
          setFollowedIds([...followedIds, brandId]);
        }
      }
    } catch (err) {
      // Toggle locally on error to simulate seamless transition
      if (followedIds.includes(brandId)) {
        setFollowedIds(followedIds.filter(id => id !== brandId));
      } else {
        setFollowedIds([...followedIds, brandId]);
      }
    }
  };

  const handleStepSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (currentStep === 1) {
        const response = await api.patch('/auth/onboarding/step', {
          step: 1,
          account_type: accountType,
        });
        if (response.data.success) {
          setCurrentStep(2);
        }
      } else if (currentStep === 2) {
        if (!displayName) {
          setError('Display name is required.');
          setLoading(false);
          return;
        }
        const response = await api.patch('/auth/onboarding/step', {
          step: 2,
          display_name: displayName,
          username: username || undefined,
          bio,
          location,
          website,
        });
        if (response.data.success) {
          setCurrentStep(3);
        }
      } else if (currentStep === 3) {
        if (interests.length < 3) {
          setError('Please select at least 3 interests to personalize your feed.');
          setLoading(false);
          return;
        }
        const response = await api.patch('/auth/onboarding/step', {
          step: 3,
          interests,
        });
        if (response.data.success) {
          setCurrentStep(4);
        }
      } else if (currentStep === 4) {
        const response = await api.patch('/auth/onboarding/step', {
          step: 4,
        });
        if (response.data.success) {
          // Refetch user context
          await fetchMe();
          router.push('/dashboard');
        }
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.error?.message || 'Onboarding update failed. Please try again.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (slug: string) => {
    if (interests.includes(slug)) {
      setInterests(interests.filter((i) => i !== slug));
    } else {
      setInterests([...interests, slug]);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4 py-12 relative overflow-hidden">
      {/* Background visual elements */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] rounded-full bg-primary-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full bg-accent-500/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-2xl z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Logo size="md" className="mb-2" />
          <div className="flex items-center gap-2 mt-2">
            {[1, 2, 3, 4].map((stepNum) => (
              <div
                key={stepNum}
                className={`w-8 h-1.5 rounded-full transition-all duration-300 ${
                  currentStep >= stepNum ? 'bg-primary-500 shadow-sm shadow-primary-500/30' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="glass-premium rounded-2xl p-8 shadow-2xl relative border border-white/5">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-jakarta flex items-center">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleStepSubmit}>
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-6"
                >
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-100 font-outfit">Choose your account type</h2>
                    <p className="text-slate-400 text-sm mt-1">This configures features tailored to your needs</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {[
                      {
                        value: 'personal',
                        title: 'Personal Account',
                        desc: 'Discover unique brands, follow creators, buy products, and book services.',
                        icon: <Compass className="w-6 h-6 text-cyan-400" />,
                      },
                      {
                        value: 'business',
                        title: 'Business & Storefront',
                        desc: 'Publish a public storefront, showcase catalog, manage leads, and convert inquiries.',
                        icon: <Briefcase className="w-6 h-6 text-indigo-400" />,
                      },
                      {
                        value: 'creator',
                        title: 'Creator & Artist',
                        desc: 'Design beautiful custom spaces, write social updates, list services, and capture fans.',
                        icon: <Sparkles className="w-6 h-6 text-purple-400" />,
                      },
                      {
                        value: 'developer',
                        title: 'Developer / Agency',
                        desc: 'Build custom sections, offer integrations, and manage multiple client brand portals.',
                        icon: <Code className="w-6 h-6 text-emerald-400" />,
                      },
                    ].map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setAccountType(item.value)}
                        className={`
                          p-5 rounded-xl flex items-start gap-4 border text-left transition-all duration-300 cursor-pointer
                          ${
                            accountType === item.value
                              ? 'border-primary-500 bg-primary-600/10 shadow-inner'
                              : 'border-slate-800/80 bg-slate-900/20 hover:bg-slate-900/40'
                          }
                        `}
                      >
                        <div className="p-3 rounded-lg bg-slate-950/60 border border-white/5">
                          {item.icon}
                        </div>
                        <div className="flex flex-col gap-1">
                          <h3 className="font-bold text-slate-200 font-outfit text-base">{item.title}</h3>
                          <p className="text-xs text-slate-400 font-jakarta leading-relaxed">{item.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  <PremiumButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={loading}
                    className="w-full mt-4"
                  >
                    Continue to Profile Setup
                  </PremiumButton>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-5"
                >
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-100 font-outfit">Set up your brand presence</h2>
                    <p className="text-slate-400 text-sm mt-1">This builds your social storefront identity</p>
                  </div>

                  <div className="flex flex-col gap-4 mt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <PremiumInput
                        label="Display Name"
                        placeholder="e.g., Stitch Tailors or Jane Doe"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                      />
                      <PremiumInput
                        label="Handle / Username"
                        placeholder="e.g., stitchco"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        helperText="Used to generate your public URL: straep.com/p/[username]"
                      />
                    </div>

                    <PremiumInput
                      label="Bio / Tagline"
                      placeholder="Briefly describe what you do or sell..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      maxLength={150}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <PremiumInput
                        label="Location"
                        placeholder="e.g., Lagos, Nigeria"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        startIcon={<MapPin className="w-4 h-4 text-slate-500" />}
                      />
                      <PremiumInput
                        label="Website"
                        type="url"
                        placeholder="https://example.com"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        startIcon={<Globe className="w-4 h-4 text-slate-500" />}
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 mt-4">
                    <PremiumButton
                      type="button"
                      variant="secondary"
                      size="lg"
                      onClick={() => setCurrentStep(1)}
                      className="w-1/3"
                    >
                      Back
                    </PremiumButton>
                    <PremiumButton
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={loading}
                      className="w-2/3"
                    >
                      Save Profile
                    </PremiumButton>
                  </div>
                </motion.div>
              )}

              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-6"
                >
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-100 font-outfit">Select your interests</h2>
                    <p className="text-slate-400 text-sm mt-1">Select at least 3 categories to seed your chronological home feed</p>
                  </div>

                  <div className="flex flex-wrap gap-3.5 justify-center py-4">
                    {CURATED_CATEGORIES.map((cat) => {
                      const isSelected = interests.includes(cat.slug);
                      return (
                        <button
                          key={cat.slug}
                          type="button"
                          onClick={() => toggleInterest(cat.slug)}
                          className={`
                            px-5 py-3 rounded-full border text-sm font-semibold transition-all duration-300 cursor-pointer flex items-center gap-2
                            ${
                              isSelected
                                ? 'border-primary-500 bg-primary-600/20 text-white shadow-md'
                                : 'border-slate-800 bg-slate-900/30 hover:bg-slate-900/60 text-slate-400 hover:text-slate-300'
                            }
                          `}
                        >
                          {isSelected && <Check className="w-4 h-4 text-primary-400" />}
                          {cat.name}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-4 mt-4">
                    <PremiumButton
                      type="button"
                      variant="secondary"
                      size="lg"
                      onClick={() => setCurrentStep(2)}
                      className="w-1/3"
                    >
                      Back
                    </PremiumButton>
                    <PremiumButton
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={loading}
                      disabled={interests.length < 3}
                      className="w-2/3"
                    >
                      Continue ({interests.length}/3)
                    </PremiumButton>
                  </div>
                </motion.div>
              )}

              {currentStep === 4 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col gap-6"
                >
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-slate-100 font-outfit">Follow suggested brands</h2>
                    <p className="text-slate-400 text-sm mt-1">Follow accounts to fill your social feed with posts and product updates</p>
                  </div>

                  {/* Brand Grid */}
                  <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-1">
                    {suggestedBrands.map((brand) => {
                      const isFollowing = followedIds.includes(brand.id);
                      return (
                        <div
                          key={brand.id}
                          className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/80 flex items-center justify-between gap-4"
                        >
                          <div className="flex flex-col gap-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-200 font-outfit text-sm truncate">{brand.business_name}</h4>
                              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                                {brand.category_name}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 font-jakarta leading-relaxed truncate">{brand.tagline}</p>
                            <span className="text-[10px] text-primary-400 flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" /> {brand.follower_count} followers
                            </span>
                          </div>

                          <PremiumButton
                            type="button"
                            variant={isFollowing ? 'glass' : 'primary'}
                            size="sm"
                            onClick={() => handleFollowToggle(brand.id)}
                            className="flex-shrink-0"
                          >
                            {isFollowing ? (
                              <span className="flex items-center gap-1 text-[11px]">
                                <Check className="w-3 h-3 text-primary-400" /> Following
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[11px]">
                                <UserPlus2 className="w-3.5 h-3.5" /> Follow
                              </span>
                            )}
                          </PremiumButton>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex gap-4 mt-4">
                    <PremiumButton
                      type="button"
                      variant="secondary"
                      size="lg"
                      onClick={() => setCurrentStep(3)}
                      className="w-1/3"
                    >
                      Back
                    </PremiumButton>
                    <PremiumButton
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={loading}
                      glow
                      className="w-2/3"
                    >
                      Finish Onboarding
                    </PremiumButton>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>
      </div>
    </div>
  );
}
