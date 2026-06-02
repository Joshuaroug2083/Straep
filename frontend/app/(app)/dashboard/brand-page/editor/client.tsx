'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../../../../lib/api';
import { usePlan } from '../../../../../hooks/usePlan';
import { PremiumButton } from '../../../../../components/PremiumButton';
import { PremiumInput } from '../../../../../components/PremiumInput';
import { 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  MoveUp, 
  MoveDown, 
  Save, 
  Globe, 
  Layout, 
  Settings, 
  Smartphone, 
  Monitor, 
  Loader2, 
  Sparkles,
  Lock,
  Menu
} from 'lucide-react';

interface Section {
  id: string;
  type: string;
  visible: boolean;
  order: number;
  settings: Record<string, any>;
}

export function BrandPageEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const brandId = searchParams.get('id');

  const { canCustomise } = usePlan();

  const [brand, setBrand] = useState<any>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('mobile');
  
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);

  // Gated brand page customization settings states
  const [primaryColor, setPrimaryColor] = useState('#4F39D9');
  const [secondaryColor, setSecondaryColor] = useState('#1D9E75');
  const [headingFont, setHeadingFont] = useState('Inter');
  const [bodyFont, setBodyFont] = useState('Inter');

  useEffect(() => {
    if (brandId) {
      fetchBrandDetails();
    } else {
      router.push('/dashboard');
    }
  }, [brandId]);

  const fetchBrandDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/brands/${brandId}`);
      if (response.data?.success) {
        const brandData = response.data.data;
        setBrand(brandData);
        setSections(brandData.draft_sections_json || []);
        
        // Settings states
        setPrimaryColor(brandData.brand_color_primary || '#4F39D9');
        setSecondaryColor(brandData.brand_color_secondary || '#1D9E75');
        setHeadingFont(brandData.heading_font || 'Inter');
        setBodyFont(brandData.body_font || 'Inter');

        if (brandData.draft_sections_json?.length > 0) {
          setSelectedSectionId(brandData.draft_sections_json[0].id);
        }
      }
    } catch (err) {
      alert('Failed to load brand details.');
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setSaveLoading(true);
    try {
      // Save sections layout
      const secResponse = await api.patch(`/brands/${brandId}/sections`, {
        draft_sections_json: sections,
      });

      // Save custom styling settings (gated endpoint patch)
      if (canCustomise) {
        await api.patch(`/brands/${brandId}`, {
          brand_color_primary: primaryColor,
          brand_color_secondary: secondaryColor,
          heading_font: headingFont,
          body_font: bodyFont,
        });
      }

      if (secResponse.data?.success) {
        alert('Draft sections autosaved successfully.');
      }
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to save sections.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handlePublish = async () => {
    setPublishLoading(true);
    try {
      // First save draft state
      await api.patch(`/brands/${brandId}/sections`, {
        draft_sections_json: sections,
      });

      // If user has customizer access
      if (canCustomise) {
        await api.patch(`/brands/${brandId}`, {
          brand_color_primary: primaryColor,
          brand_color_secondary: secondaryColor,
          heading_font: headingFont,
          body_font: bodyFont,
        });
      }

      // Publish draft to live page
      const pubResponse = await api.post(`/brands/${brandId}/publish`);
      if (pubResponse.data?.success) {
        alert('Brand page published and live!');
        router.push('/dashboard');
      }
    } catch (err) {
      alert('Failed to publish brand page.');
    } finally {
      setPublishLoading(false);
    }
  };

  // Section visibility toggle
  const toggleVisibility = (id: string) => {
    setSections(sections.map(sec => 
      sec.id === id ? { ...sec, visible: !sec.visible } : sec
    ));
  };

  // Move section in order list
  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sections.length - 1) return;

    const newSections = [...sections];
    const swapWith = direction === 'up' ? index - 1 : index + 1;
    
    // Swap objects
    const temp = newSections[index];
    newSections[index] = newSections[swapWith];
    newSections[swapWith] = temp;

    // Update internal order index
    newSections.forEach((sec, idx) => {
      sec.order = idx;
    });

    setSections(newSections);
  };

  // Handle setting updates for sections
  const updateSectionSetting = (key: string, value: any) => {
    if (!selectedSectionId) return;
    setSections(sections.map(sec => 
      sec.id === selectedSectionId 
        ? { ...sec, settings: { ...sec.settings, [key]: value } }
        : sec
    ));
  };

  const selectedSection = sections.find(sec => sec.id === selectedSectionId);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="h-[88vh] flex flex-col gap-4 max-w-7xl mx-auto overflow-hidden">
      {/* Action Header bar */}
      <div className="flex justify-between items-center bg-slate-950/60 p-4 border border-white/5 rounded-2xl flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 hover:bg-slate-900 text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold font-outfit text-slate-100">Editor: {brand.business_name}</h1>
            <p className="text-[10px] text-slate-500 font-jakarta uppercase tracking-wider">Customize your sections layout</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Preview device togglers */}
          <div className="flex rounded-xl bg-slate-900/60 p-1 border border-white/5">
            <button
              onClick={() => setPreviewMode('mobile')}
              className={`p-2 rounded-lg cursor-pointer transition-colors ${previewMode === 'mobile' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewMode('desktop')}
              className={`p-2 rounded-lg cursor-pointer transition-colors ${previewMode === 'desktop' ? 'bg-primary-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Monitor className="w-4 h-4" />
            </button>
          </div>

          <PremiumButton onClick={handleSaveDraft} isLoading={saveLoading} variant="secondary" size="md">
            Save Draft
          </PremiumButton>
          <PremiumButton onClick={handlePublish} isLoading={publishLoading} variant="primary" size="md" glow>
            Publish Page
          </PremiumButton>
        </div>
      </div>

      {/* 3-Panel Split Body */}
      <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
        
        {/* PANEL 1 (Left): Section List & Reordering */}
        <div className="w-[280px] bg-slate-950 border border-white/5 rounded-2xl p-5 flex flex-col gap-4 overflow-y-auto flex-shrink-0">
          <h3 className="text-sm font-bold font-outfit text-slate-200 uppercase tracking-wider border-b border-white/5 pb-2">Page Sections</h3>
          
          <div className="flex flex-col gap-2.5">
            {sections.map((sec, index) => {
              const isSelected = selectedSectionId === sec.id;
              return (
                <div
                  key={sec.id}
                  onClick={() => setSelectedSectionId(sec.id)}
                  className={`
                    p-3 rounded-xl border flex items-center justify-between gap-2 transition-all duration-200 cursor-pointer
                    ${
                      isSelected
                        ? 'border-primary-500 bg-primary-600/10'
                        : 'border-slate-800 bg-slate-900/10 hover:bg-slate-900/30'
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleVisibility(sec.id);
                      }}
                      className="text-slate-500 hover:text-slate-300 focus:outline-none cursor-pointer flex-shrink-0"
                    >
                      {sec.visible ? <Eye className="w-4 h-4 text-primary-400" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <span className="text-xs font-bold text-slate-300 font-outfit uppercase truncate">{sec.type}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSection(index, 'up');
                      }}
                      className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      <MoveUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSection(index, 'down');
                      }}
                      className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      <MoveDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PANEL 2 (Center): Live Preview Window */}
        <div className="flex-1 bg-slate-900/30 border border-white/5 rounded-2xl flex items-center justify-center p-4 overflow-hidden relative">
          
          {/* Simulated view wrapper */}
          <div
            className={`
              bg-dark-900 rounded-2xl border border-slate-800/80 shadow-2xl relative overflow-y-auto transition-all duration-500 flex flex-col
              ${previewMode === 'mobile' ? 'w-[320px] h-[95%]' : 'w-full h-full'}
            `}
          >
            {/* Simulated Phone Notch / Desktop Title bar */}
            {previewMode === 'mobile' && (
              <div className="h-6 bg-slate-950/80 flex justify-center items-center flex-shrink-0">
                <div className="w-20 h-3 bg-black rounded-full" />
              </div>
            )}

            {/* Simulated Navbar */}
            <div className="p-4 bg-slate-950 border-b border-white/5 flex items-center justify-between flex-shrink-0">
              <span className="font-extrabold text-xs tracking-tight font-outfit" style={{ color: primaryColor }}>
                {brand.business_name}
              </span>
              <Menu className="w-4 h-4 text-slate-400" />
            </div>

            {/* Simulated Sections content list */}
            <div className="flex-1 flex flex-col min-h-0 bg-dark-900">
              {sections
                .filter(s => s.visible)
                .map((sec) => {
                  const isSelected = selectedSectionId === sec.id;
                  return (
                    <div
                      key={sec.id}
                      onClick={() => setSelectedSectionId(sec.id)}
                      className={`
                        p-6 border-b border-white/5 transition-all relative cursor-pointer text-left
                        ${isSelected ? 'bg-primary-600/5 ring-1 ring-primary-500/30' : 'hover:bg-slate-900/10'}
                      `}
                    >
                      {/* Section tag label */}
                      <span className="absolute top-2 right-2 text-[8px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider font-outfit">
                        {sec.type}
                      </span>

                      {sec.type === 'header' && (
                        <div className="flex flex-col items-center text-center gap-2 py-4">
                          <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center font-bold text-slate-200">
                            LOGO
                          </div>
                          <h2 className="text-sm font-extrabold font-outfit" style={{ fontFamily: headingFont }}>
                            {brand.business_name}
                          </h2>
                          {sec.settings.show_tagline && (
                            <p className="text-[10px] text-slate-400 font-jakarta max-w-xs">{brand.tagline || 'Brand Tagline goes here'}</p>
                          )}
                        </div>
                      )}

                      {sec.type === 'about' && (
                        <div className="flex flex-col gap-2">
                          <h3 className="text-xs font-bold font-outfit" style={{ color: primaryColor, fontFamily: headingFont }}>
                            About Us
                          </h3>
                          <p className="text-[10px] text-slate-300 font-jakarta leading-relaxed" style={{ fontFamily: bodyFont }}>
                            {sec.settings.content || 'Share details about your business background, offerings, or history.'}
                          </p>
                        </div>
                      )}

                      {sec.type === 'products' && (
                        <div className="flex flex-col gap-3">
                          <h3 className="text-xs font-bold font-outfit" style={{ color: primaryColor, fontFamily: headingFont }}>
                            Featured Products
                          </h3>
                          <div className="grid grid-cols-2 gap-2">
                            {[1, 2].map(n => (
                              <div key={n} className="p-2 rounded-lg bg-slate-950/60 border border-white/5 flex flex-col gap-1.5">
                                <div className="aspect-square bg-slate-900 rounded flex items-center justify-center text-[10px] text-slate-600 font-jakarta">Image</div>
                                <span className="text-[9px] font-bold text-slate-300 truncate">Product Name</span>
                                <span className="text-[9px] font-bold text-primary-400">₦5,000.00</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {sec.type === 'contact' && (
                        <div className="flex flex-col gap-3 py-2">
                          <h3 className="text-xs font-bold font-outfit text-center" style={{ color: primaryColor, fontFamily: headingFont }}>
                            Get In Touch
                          </h3>
                          <div className="p-3 rounded-lg bg-slate-950/60 border border-white/5 flex flex-col gap-1.5 text-center items-center">
                            <span className="text-[8px] text-slate-400 font-jakarta">Have questions? Submit an inquiry instantly</span>
                            <div className="w-full py-1.5 rounded bg-primary-600 text-white font-bold text-[9px] uppercase tracking-wide text-center" style={{ backgroundColor: primaryColor }}>
                              Send Inquiry
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* PANEL 3 (Right): Section Content Settings & Styling */}
        <div className="w-[300px] bg-slate-950 border border-white/5 rounded-2xl p-5 flex flex-col gap-5 overflow-y-auto flex-shrink-0">
          
          {/* Section settings edit */}
          {selectedSection ? (
            <div className="flex flex-col gap-4 border-b border-white/5 pb-5">
              <h3 className="text-sm font-bold font-outfit text-slate-200 uppercase tracking-wider">
                Settings: {selectedSection.type}
              </h3>
              
              {selectedSection.type === 'header' && (
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="showTagline"
                    checked={selectedSection.settings.show_tagline ?? true}
                    onChange={(e) => updateSectionSetting('show_tagline', e.target.checked)}
                    className="w-4 h-4 rounded text-primary-600"
                  />
                  <label htmlFor="showTagline" className="text-xs text-slate-300 font-jakarta">Show Tagline</label>
                </div>
              )}

              {selectedSection.type === 'about' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-outfit">About content text</label>
                  <textarea
                    value={selectedSection.settings.content || ''}
                    onChange={(e) => updateSectionSetting('content', e.target.value)}
                    placeholder="Write details about your shop..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none font-jakarta min-h-[140px]"
                  />
                </div>
              )}

              {selectedSection.type === 'products' && (
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-outfit">Grid display mode</label>
                  <select
                    value={selectedSection.settings.display_mode || 'grid'}
                    onChange={(e) => updateSectionSetting('display_mode', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none font-jakarta"
                  >
                    <option value="grid">Grid display</option>
                    <option value="carousel">Carousel display</option>
                  </select>
                </div>
              )}
            </div>
          ) : null}

          {/* Styling customization controls (gated to professional plan) */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold font-outfit text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              Layout Styling {!canCustomise && <Lock className="w-3.5 h-3.5 text-amber-500" />}
            </h3>

            {!canCustomise ? (
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-jakarta leading-relaxed flex flex-col gap-2">
                <span>Custom color palettes, custom fonts, and styling tools are Professional plan features.</span>
                <Link href="/dashboard/billing">
                  <span className="font-bold text-primary-400 hover:text-primary-300 cursor-pointer">Upgrade Plan &rarr;</span>
                </Link>
              </div>
            ) : null}

            <div className={`flex flex-col gap-4.5 ${!canCustomise ? 'opacity-40 pointer-events-none' : ''}`}>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-0.5">Primary</span>
                  <div className="flex items-center gap-2 border border-slate-800 bg-slate-900/60 p-2 rounded-xl">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-6 h-6 border-none rounded bg-transparent"
                    />
                    <span className="text-[10px] font-mono text-slate-300 uppercase">{primaryColor}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-0.5">Secondary</span>
                  <div className="flex items-center gap-2 border border-slate-800 bg-slate-900/60 p-2 rounded-xl">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-6 h-6 border-none rounded bg-transparent"
                    />
                    <span className="text-[10px] font-mono text-slate-300 uppercase">{secondaryColor}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-0.5">Heading Font</span>
                <select
                  value={headingFont}
                  onChange={(e) => setHeadingFont(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none font-jakarta"
                >
                  <option value="Outfit">Outfit (Default)</option>
                  <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                  <option value="Inter">Inter</option>
                  <option value="Outfit">Outfit</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-0.5">Body Font</span>
                <select
                  value={bodyFont}
                  onChange={(e) => setBodyFont(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none font-jakarta"
                >
                  <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                  <option value="Inter">Inter</option>
                  <option value="Outfit">Outfit</option>
                </select>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
