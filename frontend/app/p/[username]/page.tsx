'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../../lib/api';
import { useAuth } from '../../../hooks/useAuth';
import { PremiumButton } from '../../../components/PremiumButton';
import { PremiumInput } from '../../../components/PremiumInput';
import { 
  Heart, 
  Share2, 
  MessageSquare, 
  MapPin, 
  Globe, 
  Check, 
  ShoppingBag,
  Info,
  Loader2,
  Calendar,
  X,
  Mail,
  User
} from 'lucide-react';

export default function PublicBrandPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username as string;
  const { isAuthenticated } = useAuth();

  const [brand, setBrand] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Interaction states
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'about' | 'storefront' | 'feed'>('about');

  // Inquiry modal states
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [inquiryMsg, setInquiryMsg] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  useEffect(() => {
    if (username) {
      fetchPublicBrandData();
    }
  }, [username]);

  const fetchPublicBrandData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch brand details by slug
      const brandRes = await api.get(`/brands/${username}`);
      if (brandRes.data?.success) {
        const brandData = brandRes.data.data;
        setBrand(brandData);
        setIsFollowing(brandData.current_user_follows || false);
        setFollowerCount(brandData.follower_count || 0);

        // 2. Fetch products for this brand
        const prodRes = await api.get(`/storefront/brands/${brandData.id}/products`);
        if (prodRes.data?.success) {
          setProducts(prodRes.data.data.results || []);
        }

        // 3. Fetch services for this brand
        const servRes = await api.get(`/storefront/brands/${brandData.id}/services`);
        if (servRes.data?.success) {
          setServices(servRes.data.data.results || []);
        }

        // 4. Fetch brand posts from personal feed or custom list
        // Let's filter post query if backend supports it or search posts
        const postsRes = await api.get('/posts', { params: { author: brandData.id } });
        if (postsRes.data?.success) {
          // If response has posts
          setPosts(postsRes.data.data.results || []);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Brand page not found or is currently private.');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      const response = await api.post(`/social/brands/${brand.id}/follow/`);
      if (response.data?.success) {
        setIsFollowing(response.data.data.is_following);
        setFollowerCount(response.data.data.follower_count);
      }
    } catch (err) {
      alert('Failed to follow brand.');
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName || !senderEmail || !inquiryMsg) return;

    setInquiryLoading(true);
    try {
      const response = await api.post(`/inquiries/brands/${brand.id}/inquiries`, {
        sender_name: senderName,
        sender_email: senderEmail,
        sender_phone: senderPhone,
        message: inquiryMsg,
        product_id: selectedProduct || undefined,
        service_id: selectedService || undefined,
      });

      if (response.data?.success) {
        setInquirySuccess(true);
        setInquiryMsg('');
        setSelectedProduct('');
        setSelectedService('');
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to submit inquiry.');
    } finally {
      setInquiryLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
        <div className="glass-premium rounded-2xl p-8 max-w-md text-center border border-white/5 shadow-2xl flex flex-col items-center gap-4">
          <h2 className="text-xl font-bold text-slate-100 font-outfit">Page Unavailable</h2>
          <p className="text-sm text-slate-400 font-jakarta leading-relaxed">{error || 'This page does not exist.'}</p>
          <PremiumButton variant="primary" size="md" onClick={() => router.push('/')}>
            Back to Home
          </PremiumButton>
        </div>
      </div>
    );
  }

  const primaryCol = brand.brand_color_primary || '#4F39D9';
  const secondaryCol = brand.brand_color_secondary || '#1D9E75';
  const headingFontFamily = brand.heading_font || 'Inter';
  const bodyFontFamily = brand.body_font || 'Inter';

  // Find visible sections list
  const sections = brand.sections_json || [];

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 font-jakarta pb-16" style={{ fontFamily: bodyFontFamily }}>
      
      {/* Cover / Header section */}
      <div className="h-44 md:h-64 bg-slate-950 relative overflow-hidden">
        {brand.cover_url ? (
          <img src={brand.cover_url} alt="Cover Image" className="w-full h-full object-cover opacity-60" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 opacity-80" />
        )}
        {/* Glow overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 to-transparent" />
      </div>

      {/* Profile summary banner */}
      <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/5 pb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-end min-w-0">
          {/* Logo / Avatar */}
          <div className="w-24 h-24 rounded-2xl bg-slate-900 border-2 border-dark-900 shadow-xl overflow-hidden flex items-center justify-center flex-shrink-0 bg-gradient-to-tr from-slate-800 to-slate-950">
            {brand.logo_url ? (
              <img src={brand.logo_url} alt={brand.business_name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-slate-300 font-outfit uppercase">
                {brand.business_name.charAt(0)}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 truncate font-outfit" style={{ fontFamily: headingFontFamily }}>
              {brand.business_name}
            </h1>
            <p className="text-sm text-slate-400 font-jakarta leading-relaxed max-w-xl">{brand.tagline}</p>
            
            <div className="flex items-center gap-3 text-xs text-slate-500 font-jakarta mt-1 flex-wrap">
              {brand.location_city && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {brand.location_city}</span>}
              <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-red-500" /> {followerCount} followers</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <PremiumButton
            onClick={handleFollowToggle}
            variant={isFollowing ? 'glass' : 'primary'}
            size="md"
            className="flex-shrink-0"
            style={!isFollowing ? { backgroundColor: primaryCol, borderColor: primaryCol } : {}}
          >
            {isFollowing ? 'Following' : 'Follow Brand'}
          </PremiumButton>
          
          <PremiumButton
            onClick={() => {
              setInquirySuccess(false);
              setShowInquiryModal(true);
            }}
            variant="accent"
            size="md"
            glow
            className="flex-shrink-0"
          >
            Send Inquiry
          </PremiumButton>
        </div>
      </div>

      {/* Tabs navigation block */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="flex gap-2 border-b border-white/5 pb-2">
          {[
            { id: 'about', label: 'About Page', icon: <Info className="w-4 h-4" /> },
            { id: 'storefront', label: 'Storefront', icon: <ShoppingBag className="w-4 h-4" /> },
            { id: 'feed', label: 'Feed & Updates', icon: <MessageSquare className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 font-outfit
                ${
                  activeTab === tab.id
                    ? 'bg-slate-950 text-white border border-white/5'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/40'
                }
              `}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab contents */}
        <div className="mt-8">
          {activeTab === 'about' && (
            <div className="flex flex-col gap-6 max-w-2xl text-left">
              {sections.length === 0 ? (
                <div className="p-6 glass rounded-2xl border border-white/5">
                  <h3 className="font-bold text-slate-200 font-outfit mb-2">Welcome!</h3>
                  <p className="text-sm text-slate-400 font-jakarta leading-relaxed">{brand.description || 'Welcome to our brand page! Use the tabs to browse our storefront catalog and see recent updates.'}</p>
                </div>
              ) : (
                sections
                  .filter((sec: any) => sec.visible)
                  .map((sec: any) => (
                    <div key={sec.id} className="p-6 glass rounded-2xl border border-white/5 flex flex-col gap-4">
                      {sec.type === 'about' && (
                        <>
                          <h3 className="text-lg font-bold font-outfit" style={{ color: primaryCol, fontFamily: headingFontFamily }}>About {brand.business_name}</h3>
                          <p className="text-sm text-slate-300 font-jakarta leading-relaxed whitespace-pre-line">{sec.settings.content || brand.description}</p>
                        </>
                      )}
                      
                      {sec.type === 'contact' && (
                        <div className="text-center py-4 flex flex-col items-center gap-4">
                          <h3 className="text-lg font-bold font-outfit" style={{ color: primaryCol, fontFamily: headingFontFamily }}>Get in touch with us</h3>
                          <p className="text-xs text-slate-400 font-jakarta max-w-sm">Have specific custom inquiries, pricing requests, or questions? Send us an inquiry and we'll reply shortly.</p>
                          <PremiumButton
                            onClick={() => setShowInquiryModal(true)}
                            variant="primary"
                            size="md"
                            glow
                            style={{ backgroundColor: primaryCol, borderColor: primaryCol }}
                          >
                            Submit Inquiry Form
                          </PremiumButton>
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>
          )}

          {activeTab === 'storefront' && (
            <div className="flex flex-col gap-8 text-left">
              {/* Products Section */}
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-bold font-outfit" style={{ color: primaryCol, fontFamily: headingFontFamily }}>Products Catalog</h3>
                {products.length === 0 ? (
                  <p className="text-sm text-slate-500 font-jakarta pl-1">No products listed yet.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {products.map((prod) => (
                      <div key={prod.id} className="glass rounded-xl p-3 border border-white/5 flex flex-col gap-2 relative overflow-hidden group">
                        <div className="aspect-square bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
                          {prod.thumbnail_url ? (
                            <img src={prod.thumbnail_url} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          ) : (
                            <ShoppingBag className="w-8 h-8 text-slate-700" />
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-slate-300 truncate mt-1">{prod.name}</h4>
                        <span className="text-xs font-bold text-primary-400">₦{parseFloat(prod.price).toLocaleString()}</span>
                        <PremiumButton
                          onClick={() => {
                            setSelectedProduct(prod.id);
                            setShowInquiryModal(true);
                          }}
                          variant="glass"
                          size="sm"
                          className="w-full mt-1 text-[10px] uppercase font-bold"
                        >
                          Inquire
                        </PremiumButton>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Services Section */}
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-bold font-outfit" style={{ color: primaryCol, fontFamily: headingFontFamily }}>Services & Bookings</h3>
                {services.length === 0 ? (
                  <p className="text-sm text-slate-500 font-jakarta pl-1">No services listed yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {services.map((serv) => (
                      <div key={serv.id} className="glass rounded-xl p-4 border border-white/5 flex flex-col justify-between gap-3">
                        <div className="flex flex-col gap-1">
                          <h4 className="text-sm font-bold text-slate-200 truncate">{serv.name}</h4>
                          <p className="text-xs text-slate-400 font-jakarta line-clamp-2">{serv.description}</p>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <div className="flex flex-col">
                            <span className="text-[10px] text-slate-500 font-jakarta">Starting from</span>
                            <span className="text-xs font-bold text-primary-400">₦{parseFloat(serv.starting_price).toLocaleString()}</span>
                          </div>
                          <PremiumButton
                            onClick={() => {
                              setSelectedService(serv.id);
                              setShowInquiryModal(true);
                            }}
                            variant="glass"
                            size="sm"
                            className="text-[10px] uppercase font-bold"
                          >
                            Book Info
                          </PremiumButton>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'feed' && (
            <div className="flex flex-col gap-5 max-w-2xl text-left">
              <h3 className="text-lg font-bold font-outfit" style={{ color: primaryCol, fontFamily: headingFontFamily }}>Social Feed</h3>
              {posts.length === 0 ? (
                <div className="p-8 text-center text-slate-500 font-jakarta text-sm glass rounded-2xl border border-white/5">
                  No feed posts published yet by this brand.
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="glass rounded-2xl p-6 border border-white/5 flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center font-bold text-sm text-white uppercase">
                        {brand.business_name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-200">{brand.business_name}</span>
                        <span className="text-[9px] text-slate-500">{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <p className="text-sm text-slate-300 font-jakarta leading-relaxed whitespace-pre-line">{post.content}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Inquiry Form Modal overlay */}
      {showInquiryModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-premium rounded-2xl p-8 max-w-md w-full border border-white/10 shadow-2xl relative">
            <button
              onClick={() => setShowInquiryModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {!inquirySuccess ? (
              <form onSubmit={handleInquirySubmit} className="flex flex-col gap-5 text-left">
                <h3 className="text-xl font-bold font-outfit text-slate-100 mb-2">Send Inquiry</h3>
                
                <PremiumInput
                  label="Your Name"
                  placeholder="e.g. John Doe"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  startIcon={<User className="w-4 h-4 text-slate-500" />}
                  required
                />

                <PremiumInput
                  label="Email Address"
                  type="email"
                  placeholder="e.g. john@example.com"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  startIcon={<Mail className="w-4 h-4 text-slate-500" />}
                  required
                />

                <PremiumInput
                  label="Phone Number (Optional)"
                  placeholder="e.g. +2348012345678"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                />

                <div className="flex flex-col gap-1.5 w-full">
                  <label className="text-xs font-semibold text-slate-400 font-outfit uppercase tracking-wider pl-1">
                    Your Message / Custom Request
                  </label>
                  <textarea
                    value={inquiryMsg}
                    onChange={(e) => setInquiryMsg(e.target.value)}
                    placeholder="Describe details of what you need, customized features, sizing, availability..."
                    required
                    className="w-full bg-slate-900/60 border border-slate-800/80 focus:border-primary-500 rounded-xl p-4 text-xs text-slate-200 focus:outline-none font-jakarta resize-none min-h-[100px]"
                  />
                </div>

                <PremiumButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={inquiryLoading}
                  glow
                  className="mt-2 w-full"
                  style={{ backgroundColor: primaryCol, borderColor: primaryCol }}
                >
                  Send Inquiry Form
                </PremiumButton>
              </form>
            ) : (
              <div className="text-center py-6 flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Check className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-100 font-outfit">Inquiry Submitted!</h3>
                <p className="text-xs text-slate-400 font-jakarta leading-relaxed">
                  Your inquiry was successfully routed to the brand owner. They will follow up with you directly.
                </p>
                <PremiumButton variant="secondary" size="md" onClick={() => setShowInquiryModal(false)} className="px-6 mt-2">
                  Close Window
                </PremiumButton>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
