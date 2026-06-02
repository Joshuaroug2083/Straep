'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { useAuth } from '../../../hooks/useAuth';
import { PremiumButton } from '../../../components/PremiumButton';
import { PremiumInput } from '../../../components/PremiumInput';
import Link from 'next/link';
import { 
  Eye, 
  Users, 
  MessageSquare, 
  Percent, 
  ExternalLink, 
  Plus, 
  Edit3, 
  Inbox, 
  ArrowUpRight,
  Loader2,
  AlertCircle,
  Sparkles
} from 'lucide-react';

export default function DashboardOverview() {
  const { user } = useAuth();
  
  const [brand, setBrand] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Brand creation form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Categories first (just in case they need to create a page)
      const catRes = await api.get('/categories');
      if (catRes.data?.success) {
        setCategoryList(catRes.data.data);
        if (catRes.data.data.length > 0) {
          setSelectedCategory(catRes.data.data[0].id);
        }
      }

      // 2. Fetch User's Brand Page
      const brandRes = await api.get('/brands/my-brand');
      if (brandRes.data?.success) {
        const brandData = brandRes.data.data;
        setBrand(brandData);
        
        // 3. Fetch Analytics for Brand Page
        const analyticsRes = await api.get(`/brands/${brandData.id}/analytics`);
        if (analyticsRes.data?.success) {
          setAnalytics(analyticsRes.data.data.summary);
        }

        // 4. Fetch Recent Leads
        const leadsRes = await api.get('/inquiries/dashboard/leads');
        if (leadsRes.data?.success) {
          setRecentLeads(leadsRes.data.data.inquiries.slice(0, 5));
        }
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        // User has no brand page yet
        setBrand(null);
      } else {
        setError(err.response?.data?.error?.message || 'Failed to load dashboard data.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName) return;

    setCreateLoading(true);
    try {
      const response = await api.post('/brands/', {
        business_name: businessName,
        tagline,
        description,
        category: selectedCategory || null,
      });

      if (response.data?.success) {
        setBrand(response.data.data);
        setShowCreateForm(false);
        // Refresh full dashboard details
        fetchDashboardData();
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to create brand page.');
    } finally {
      setCreateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    );
  }

  // If user does not have a brand page yet, show visual onboarding card
  if (!brand) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center">
        {!showCreateForm ? (
          <div className="glass-premium rounded-2xl p-8 border border-white/5 shadow-2xl flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-600 to-accent-500 rotate-12 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-extrabold font-outfit text-slate-100">Build Your Brand Hub</h1>
              <p className="text-sm text-slate-400 font-jakarta leading-relaxed max-w-sm">
                Get started by creating your brand page. List products, design layouts, collect customer inquiries, and grow your audience.
              </p>
            </div>

            <PremiumButton
              variant="primary"
              size="lg"
              glow
              onClick={() => setShowCreateForm(true)}
              className="px-8 mt-2"
            >
              Initialize Brand Page
            </PremiumButton>
          </div>
        ) : (
          <div className="glass-premium rounded-2xl p-8 border border-white/5 shadow-2xl text-left">
            <h2 className="text-2xl font-bold font-outfit text-slate-100 mb-6">Configure Your Storefront</h2>
            
            <form onSubmit={handleCreateBrand} className="flex flex-col gap-5">
              <PremiumInput
                label="Business / Brand Name"
                placeholder="e.g., Stitch Tailoring Studio"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
              />

              <PremiumInput
                label="Tagline / Short Pitch"
                placeholder="e.g., Premium bespoke styling for modern professionals"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
              />

              <div className="flex flex-col gap-1.5 w-full">
                <label className="text-xs font-semibold text-slate-400 font-outfit uppercase tracking-wider pl-1">
                  Brand Industry Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-900/40 hover:bg-slate-900/60 border border-slate-800/80 focus:border-primary-500 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary-500/20 font-jakarta"
                >
                  {categoryList.map((cat) => (
                    <option key={cat.id} value={cat.id} className="bg-slate-950">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <PremiumButton
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </PremiumButton>
                <PremiumButton
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={createLoading}
                  glow
                >
                  Create Page
                </PremiumButton>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

  // Loaded successfully and user has a brand
  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold font-outfit text-slate-100">{brand.business_name}</h1>
          <p className="text-sm text-slate-400 font-jakarta flex items-center gap-2">
            <span>{brand.tagline || 'Manage your social storefront'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            <Link
              href={`/p/${brand.username_slug}`}
              target="_blank"
              className="text-primary-400 hover:text-primary-300 font-semibold flex items-center gap-0.5"
            >
              View Public Page <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </p>
        </div>

        <div className="flex gap-3">
          <Link href={`/dashboard/brand-page/editor?id=${brand.id}`}>
            <PremiumButton variant="glass" size="md" className="flex items-center gap-2">
              <Edit3 className="w-4 h-4" /> Layout Editor
            </PremiumButton>
          </Link>
          <Link href="/dashboard/leads">
            <PremiumButton variant="primary" size="md" glow className="flex items-center gap-2">
              <Inbox className="w-4 h-4" /> View Inbox
            </PremiumButton>
          </Link>
        </div>
      </div>

      {/* Analytics Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Profile Views',
            value: analytics?.profile_views ?? brand.view_count,
            change: `+${analytics?.profile_views_change ?? 0}%`,
            icon: <Eye className="w-5 h-5 text-indigo-400" />,
          },
          {
            title: 'Followers',
            value: analytics?.new_followers ?? brand.follower_count,
            change: `+${analytics?.new_followers_change ?? 0}%`,
            icon: <Users className="w-5 h-5 text-purple-400" />,
          },
          {
            title: 'Inquiries (Leads)',
            value: analytics?.inquiry_count ?? brand.inquiry_count,
            change: `+${analytics?.inquiry_count_change ?? 0}%`,
            icon: <MessageSquare className="w-5 h-5 text-cyan-400" />,
          },
          {
            title: 'Response Rate',
            value: `${analytics?.conversion_rate ?? brand.response_rate}%`,
            change: 'Stable',
            icon: <Percent className="w-5 h-5 text-emerald-400" />,
          },
        ].map((card, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl glass border border-white/5 shadow-md flex flex-col gap-3 relative overflow-hidden"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-400 font-outfit uppercase tracking-wider">
                {card.title}
              </span>
              <div className="p-2 rounded-lg bg-slate-900/60 border border-white/5">
                {card.icon}
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-100 font-outfit">{card.value}</span>
              <span className="text-[10px] font-bold text-emerald-400 font-jakarta">{card.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Quick Actions and Recent Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Quick actions */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col gap-4">
            <h3 className="font-bold text-slate-200 font-outfit text-lg border-b border-white/5 pb-2">Quick Actions</h3>
            
            <div className="flex flex-col gap-3">
              {[
                { label: 'Edit Sections Layout', desc: 'Drag-and-drop sections', href: `/dashboard/brand-page/editor?id=${brand.id}` },
                { label: 'Post Update to Feed', desc: 'Text, polls, updates', href: '/home' },
              ].map((act, index) => (
                <Link key={index} href={act.href} className="w-full">
                  <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/10 hover:bg-slate-900/40 text-left transition-all duration-200 cursor-pointer flex justify-between items-center group">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-sm font-bold text-slate-300 group-hover:text-slate-100 transition-colors font-outfit">{act.label}</span>
                      <span className="text-[10px] text-slate-500 font-jakarta">{act.desc}</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Recent Leads */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="font-bold text-slate-200 font-outfit text-lg">Recent Customer Leads</h3>
              <Link
                href="/dashboard/leads"
                className="text-xs font-semibold text-primary-400 hover:text-primary-300 font-jakarta"
              >
                View All Leads
              </Link>
            </div>

            {recentLeads.length === 0 ? (
              <div className="py-12 text-center text-slate-500 font-jakarta text-sm flex flex-col items-center gap-3">
                <Inbox className="w-8 h-8 opacity-50" />
                No leads received yet. Promote your page to receive inquiries!
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {recentLeads.map((lead) => (
                  <Link key={lead.id} href="/dashboard/leads">
                    <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/10 hover:bg-slate-900/30 flex items-center justify-between gap-4 transition-all duration-200 cursor-pointer">
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-300 font-outfit truncate">{lead.sender_name}</span>
                          <span className="text-[10px] text-slate-500 font-jakarta truncate">{lead.sender_email}</span>
                        </div>
                        <p className="text-xs text-slate-400 font-jakarta truncate">{lead.message}</p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`
                          px-2 py-0.5 text-[10px] rounded-full uppercase tracking-wider font-bold font-jakarta
                          ${
                            lead.status === 'new' ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20' :
                            lead.status === 'converted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            'bg-slate-800 text-slate-400 border border-slate-700'
                          }
                        `}>
                          {lead.status}
                        </span>
                        <ArrowUpRight className="w-4 h-4 text-slate-600" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
