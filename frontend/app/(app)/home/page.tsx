'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { useAuth } from '../../../hooks/useAuth';
import { usePlan } from '../../../hooks/usePlan';
import { PremiumButton } from '../../../components/PremiumButton';
import { PremiumInput } from '../../../components/PremiumInput';
import Link from 'next/link';
import { 
  MessageSquare, 
  Heart, 
  Send, 
  Bookmark, 
  Plus, 
  Loader2, 
  Briefcase, 
  Sparkles,
  HelpCircle,
  Megaphone,
  AlertTriangle,
  Lock,
  Compass
} from 'lucide-react';

export default function HomeFeed() {
  const { user } = useAuth();
  const { isOpportunityPostingAllowed } = usePlan();

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);
  
  // Post publisher states
  const [newPostContent, setNewPostContent] = useState('');
  const [postType, setPostType] = useState<'text' | 'opportunity' | 'offer'>('text');
  const [publisherLoading, setPublisherLoading] = useState(false);
  const [pubError, setPubError] = useState<string | null>(null);

  // Recommendations
  const [recBrands, setRecBrands] = useState<any[]>([]);

  useEffect(() => {
    fetchFeed();
    fetchRecommendations();
  }, []);

  const fetchFeed = async () => {
    setLoading(true);
    setFeedError(null);
    try {
      const response = await api.get('/posts/feed');
      if (response.data?.success) {
        setPosts(response.data.data.posts || []);
      }
    } catch (err: any) {
      setFeedError(err.response?.data?.error?.message || 'Failed to load chronological feed.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await api.get('/discover');
      if (response.data?.success) {
        setRecBrands(response.data.data.trending_brands.slice(0, 3) || []);
      }
    } catch (err) {
      // ignore recommendations fail
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    setPubError(null);

    // Gating check for opportunity posting
    if (postType === 'opportunity' && !isOpportunityPostingAllowed) {
      setPubError('Opportunity postings require a Business subscription plan.');
      return;
    }

    setPublisherLoading(true);
    try {
      const response = await api.post('/posts/', {
        content: newPostContent,
        post_type: postType,
      });

      if (response.data?.success) {
        setNewPostContent('');
        setPostType('text');
        // Refresh feed list
        fetchFeed();
      }
    } catch (err: any) {
      setPubError(err.response?.data?.error?.message || 'Failed to publish feed post.');
    } finally {
      setPublisherLoading(false);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      const response = await api.post(`/social/posts/${postId}/like/`);
      if (response.data?.success) {
        const isLiked = response.data.data.is_liked;
        const count = response.data.data.like_count;
        
        setPosts(posts.map(p => 
          p.id === postId 
            ? { ...p, current_user_liked: isLiked, like_count: count } 
            : p
        ));
      }
    } catch (err) {
      // error ignore
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto h-[86vh] overflow-hidden min-h-0">
      
      {/* Left column + Middle column: Post Publisher & Personal Feed */}
      <div className="lg:col-span-2 flex flex-col gap-6 overflow-y-auto pr-1">
        
        {/* Post Publisher: visible to creators and businesses */}
        {user && user.account_type !== 'personal' && (
          <div className="glass rounded-2xl p-5 border border-white/5 shadow-md flex flex-col gap-4 text-left">
            <h3 className="text-xs font-bold font-outfit text-slate-400 uppercase tracking-wider pl-0.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary-400" /> Share a Brand Update
            </h3>

            {pubError && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-jakarta flex items-center">
                <span>{pubError}</span>
              </div>
            )}

            <form onSubmit={handleCreatePost} className="flex flex-col gap-4">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="What's new with your storefront? Announce product arrivals, flash offers, or opportunities..."
                className="w-full bg-slate-900/40 border border-slate-800/80 focus:border-primary-500 rounded-xl p-4 text-sm text-slate-200 focus:outline-none font-jakarta resize-none min-h-[90px]"
                required
              />

              <div className="flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center">
                {/* Post Type Toggles */}
                <div className="flex gap-2 p-1 bg-slate-900/60 rounded-xl border border-white/5">
                  {[
                    { type: 'text', label: 'General', icon: <Megaphone className="w-3.5 h-3.5" /> },
                    { type: 'offer', label: 'Flash Offer', icon: <Sparkles className="w-3.5 h-3.5" /> },
                    { type: 'opportunity', label: 'B2B/Collab', icon: <Briefcase className="w-3.5 h-3.5" />, gated: !isOpportunityPostingAllowed },
                  ].map((btn) => (
                    <button
                      key={btn.type}
                      type="button"
                      onClick={() => setPostType(btn.type as any)}
                      className={`
                        px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer
                        ${
                          postType === btn.type
                            ? 'bg-primary-600 text-white shadow-sm'
                            : 'text-slate-400 hover:text-slate-200'
                        }
                      `}
                    >
                      {btn.icon}
                      {btn.label}
                      {btn.gated && <Lock className="w-2.5 h-2.5 text-amber-500" />}
                    </button>
                  ))}
                </div>

                <PremiumButton type="submit" variant="primary" size="sm" isLoading={publisherLoading} className="px-6 flex items-center gap-2 self-end sm:self-auto">
                  <Send className="w-3.5 h-3.5" /> Publish Post
                </PremiumButton>
              </div>
            </form>
          </div>
        )}

        {/* Feed List area */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold font-outfit text-slate-100 border-b border-white/5 pb-2 text-left">Your Personal Feed</h2>

          {loading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : feedError ? (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-jakarta">
              {feedError}
            </div>
          ) : posts.length === 0 ? (
            <div className="py-16 text-center text-slate-500 font-jakarta text-sm glass rounded-2xl border border-white/5 flex flex-col items-center gap-3">
              <MessageSquare className="w-10 h-10 opacity-30" />
              <span>Your feed is currently empty. Discover and follow brands to fill your feed!</span>
              <Link href="/discover">
                <PremiumButton variant="glass" size="sm" className="mt-2">
                  Browse Discover
                </PremiumButton>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {posts.map((post) => (
                <div key={post.id} className="glass rounded-2xl p-6 border border-white/5 flex flex-col gap-4 text-left">
                  {/* Brand Header */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center font-bold text-slate-300 font-outfit uppercase">
                        {post.author_logo ? (
                          <img src={post.author_logo} alt={post.author_name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          post.author_name.charAt(0)
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <Link href={`/p/${post.author_slug}`} className="hover:text-primary-400 transition-colors font-bold text-sm text-slate-200 truncate font-outfit">
                          {post.author_name}
                        </Link>
                        <span className="text-[10px] text-slate-500 font-jakarta">{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <span className={`
                      px-2 py-0.5 text-[9px] rounded-full uppercase tracking-wider font-bold font-jakarta
                      ${
                        post.post_type === 'opportunity' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        post.post_type === 'offer' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        'bg-slate-800 text-slate-400 border border-slate-700'
                      }
                    `}>
                      {post.post_type}
                    </span>
                  </div>

                  {/* Content body */}
                  <p className="text-sm text-slate-300 font-jakarta leading-relaxed whitespace-pre-line">{post.content}</p>

                  {/* Feed Interaction Buttons */}
                  <div className="flex gap-4 border-t border-white/5 pt-3.5 mt-2.5">
                    <button
                      onClick={() => handleLikePost(post.id)}
                      className={`flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors ${post.current_user_liked ? 'text-red-400' : 'text-slate-400 hover:text-red-400'}`}
                    >
                      <Heart className={`w-4 h-4 ${post.current_user_liked ? 'fill-current' : ''}`} />
                      <span>{post.like_count} Likes</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-primary-400 cursor-pointer">
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.comment_count} Comments</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right column: Recommended Brands panel */}
      <div className="hidden lg:flex flex-col gap-6">
        <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col gap-4 text-left">
          <h3 className="font-bold text-slate-200 font-outfit text-sm border-b border-white/5 pb-2 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-primary-400" /> Curated Suggestions
          </h3>

          {recBrands.length === 0 ? (
            <p className="text-xs text-slate-500 font-jakarta">No recommendations available.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {recBrands.map((brand) => (
                <div key={brand.id} className="p-3 rounded-xl border border-slate-800 bg-slate-900/10 flex flex-col gap-1">
                  <Link href={`/p/${brand.username_slug}`} className="font-bold text-slate-200 hover:text-primary-400 transition-colors text-xs font-outfit truncate">
                    {brand.business_name}
                  </Link>
                  <p className="text-[10px] text-slate-400 font-jakarta line-clamp-1">{brand.tagline}</p>
                </div>
              ))}
            </div>
          )}

          <Link href="/discover" className="mt-2">
            <PremiumButton variant="glass" size="sm" className="w-full text-[10px] uppercase font-bold">
              Explore Showcase
            </PremiumButton>
          </Link>
        </div>
      </div>

    </div>
  );
}
