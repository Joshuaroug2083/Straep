'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../../lib/api';
import { PremiumInput } from '../../../components/PremiumInput';
import { PremiumButton } from '../../../components/PremiumButton';
import Link from 'next/link';
import { 
  Search, 
  MapPin, 
  Grid, 
  TrendingUp, 
  Award, 
  Loader2, 
  Compass, 
  ExternalLink,
  Tag
} from 'lucide-react';

export default function DiscoverShowcase() {
  const [categories, setCategories] = useState<any[]>([]);
  const [discoverData, setDiscoverData] = useState<any>(null);
  
  // Search parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState('');
  
  // Results states
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiscoverShowcase();
  }, []);

  const fetchDiscoverShowcase = async () => {
    setLoading(true);
    try {
      // 1. Fetch categories
      const catRes = await api.get('/categories');
      if (catRes.data?.success) {
        setCategories(catRes.data.data);
      }

      // 2. Fetch discover dashboard
      const discRes = await api.get('/discover');
      if (discRes.data?.success) {
        setDiscoverData(discRes.data.data);
      }
    } catch (err) {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // If search inputs are cleared, return to showcase
    if (!searchQuery && !selectedCategory && !selectedLocation) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setLoading(true);
    try {
      const params: any = { type: 'brands' };
      if (searchQuery) params.q = searchQuery;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedLocation) params.location = selectedLocation;

      const response = await api.get('/search', { params });
      if (response.data?.success) {
        setSearchResults(response.data.data.brands?.results || []);
      }
    } catch (err) {
      // error ignore
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categorySlug: string) => {
    const nextCategory = selectedCategory === categorySlug ? '' : categorySlug;
    setSelectedCategory(nextCategory);
    
    // Trigger search with updated category state immediately
    // setTimeout to allow state batching to register
    setTimeout(() => {
      triggerSearchQuery(searchQuery, nextCategory, selectedLocation);
    }, 50);
  };

  const triggerSearchQuery = async (query: string, category: string, location: string) => {
    if (!query && !category && !location) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    setLoading(true);
    try {
      const params: any = { type: 'brands' };
      if (query) params.q = query;
      if (category) params.category = category;
      if (location) params.location = location;

      const response = await api.get('/search', { params });
      if (response.data?.success) {
        setSearchResults(response.data.data.brands?.results || []);
      }
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto h-[86vh] overflow-y-auto pr-1 text-left">
      
      {/* Hero Header panel */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 p-8 border border-white/5 shadow-xl flex flex-col gap-4">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full bg-primary-600/10 blur-[90px] pointer-events-none" />
        
        <div className="max-w-xl flex flex-col gap-2">
          <span className="text-xs font-bold text-primary-400 font-outfit uppercase tracking-wider flex items-center gap-1.5">
            <Compass className="w-4 h-4" /> Showcase Showcase
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold font-outfit text-slate-100">Discover Social Storefronts</h1>
          <p className="text-sm text-slate-400 font-jakarta leading-relaxed">
            Search custom creator catalogs, local craft businesses, tailor services, and follow pages for fresh feed updates.
          </p>
        </div>

        {/* Big Search Box Form */}
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3 mt-2">
          <div className="flex-1">
            <PremiumInput
              placeholder="Search brands, products, taglines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startIcon={<Search className="w-4 h-4 text-slate-500" />}
            />
          </div>
          <div className="w-full md:w-[220px]">
            <PremiumInput
              placeholder="City or location..."
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              startIcon={<MapPin className="w-4 h-4 text-slate-500" />}
            />
          </div>
          <PremiumButton type="submit" variant="primary" size="md" glow className="px-8 flex-shrink-0">
            Search Showroom
          </PremiumButton>
        </form>
      </div>

      {/* Horizontal Category Chips Bar */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold font-outfit text-slate-400 uppercase tracking-wider pl-1 flex items-center gap-1.5">
          <Tag className="w-4 h-4 text-primary-400" /> Explore Industries
        </h3>
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.slug}
                onClick={() => handleCategoryClick(cat.slug)}
                className={`
                  px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-300 cursor-pointer
                  ${
                    isSelected
                      ? 'bg-primary-600 border-primary-500 text-white shadow-lg shadow-primary-500/10'
                      : 'bg-slate-950 border border-white/5 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }
                `}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Showcase sections vs Search Results */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
        </div>
      ) : isSearching ? (
        // Search Results layout
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold font-outfit text-slate-100 pl-1 border-b border-white/5 pb-2">
            Search Results ({searchResults.length})
          </h2>
          {searchResults.length === 0 ? (
            <div className="py-16 text-center text-slate-500 font-jakarta text-sm glass rounded-2xl border border-white/5">
              No brand pages found matching your query.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((brand) => (
                <Link key={brand.id} href={`/p/${brand.username_slug}`}>
                  <div className="glass p-5 rounded-2xl border border-white/5 hover:border-primary-500/40 transition-all duration-300 text-left flex flex-col justify-between gap-4 h-full cursor-pointer relative overflow-hidden group">
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-200 font-outfit group-hover:text-primary-400 transition-colors text-base truncate">{brand.business_name}</h3>
                        {brand.is_verified && <span className="bg-primary-500/10 text-primary-400 border border-primary-500/20 px-1.5 py-0.5 rounded text-[8px] font-bold">Verified</span>}
                      </div>
                      <p className="text-xs text-slate-400 font-jakarta line-clamp-2 leading-relaxed">{brand.tagline}</p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-jakarta border-t border-white/5 pt-3">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {brand.location_city || 'Remote'}</span>
                      <span className="text-primary-400 font-semibold flex items-center gap-0.5">Explore page <ExternalLink className="w-3 h-3" /></span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Showcase Layout lists
        <div className="flex flex-col gap-8">
          {/* Featured Brands */}
          {discoverData?.featured_brands && discoverData.featured_brands.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold font-outfit text-slate-100 flex items-center gap-2 pl-1">
                <Award className="w-5 h-5 text-amber-400" /> Featured Storefronts
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {discoverData.featured_brands.map((brand: any) => (
                  <Link key={brand.id} href={`/p/${brand.username_slug}`}>
                    <div className="glass p-5 rounded-2xl border border-white/5 hover:border-primary-500/40 transition-all duration-300 text-left flex flex-col justify-between gap-4 h-full cursor-pointer relative overflow-hidden group">
                      <div className="flex flex-col gap-1.5 min-w-0">
                        <h3 className="font-bold text-slate-200 font-outfit group-hover:text-primary-400 transition-colors text-base truncate">{brand.business_name}</h3>
                        <p className="text-xs text-slate-400 font-jakarta line-clamp-2 leading-relaxed">{brand.tagline}</p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-jakarta border-t border-white/5 pt-3">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {brand.location_city || 'Remote'}</span>
                        <span className="text-primary-400 font-semibold flex items-center gap-0.5">Explore page <ExternalLink className="w-3 h-3" /></span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Trending Brands */}
          {discoverData?.trending_brands && discoverData.trending_brands.length > 0 && (
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-bold font-outfit text-slate-100 flex items-center gap-2 pl-1">
                <TrendingUp className="w-5 h-5 text-purple-400" /> Trending Showrooms
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {discoverData.trending_brands.map((brand: any) => (
                  <Link key={brand.id} href={`/p/${brand.username_slug}`}>
                    <div className="glass p-5 rounded-2xl border border-white/5 hover:border-primary-500/40 transition-all duration-300 text-left flex flex-col justify-between gap-4 h-full cursor-pointer relative overflow-hidden group">
                      <div className="flex flex-col gap-1.5 min-w-0">
                        <h3 className="font-bold text-slate-200 font-outfit group-hover:text-primary-400 transition-colors text-base truncate">{brand.business_name}</h3>
                        <p className="text-xs text-slate-400 font-jakarta line-clamp-2 leading-relaxed">{brand.tagline}</p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-jakarta border-t border-white/5 pt-3">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {brand.location_city || 'Remote'}</span>
                        <span className="text-primary-400 font-semibold flex items-center gap-0.5">Explore page <ExternalLink className="w-3 h-3" /></span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
