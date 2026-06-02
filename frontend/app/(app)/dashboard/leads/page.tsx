'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../../../lib/api';
import { usePlan } from '../../../../hooks/usePlan';
import { PremiumInput } from '../../../../components/PremiumInput';
import { PremiumButton } from '../../../../components/PremiumButton';
import { 
  Inbox, 
  Search, 
  ChevronRight, 
  Calendar, 
  Loader2, 
  X, 
  Save, 
  AlertTriangle,
  Lock,
  MessageCircle,
  Phone,
  Mail
} from 'lucide-react';

export default function LeadsInbox() {
  const { isFree, maxActiveLeads } = usePlan();
  
  const [leads, setLeads] = useState<any[]>([]);
  const [hiddenCount, setHiddenCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Detail sidebar states
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [leadStatus, setLeadStatus] = useState('new');
  const [privateNotes, setPrivateNotes] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, [statusFilter]);

  const fetchLeads = async (searchQuery = search) => {
    setLoading(true);
    setError(null);
    try {
      let url = '/inquiries/dashboard/leads';
      const params: any = {};
      if (statusFilter) params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;

      const response = await api.get(url, { params });
      if (response.data?.success) {
        setLeads(response.data.data.inquiries);
        setHiddenCount(response.data.data.hidden_count);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to fetch leads.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLeads();
  };

  const handleSelectLead = async (leadId: string) => {
    setDetailLoading(true);
    try {
      const response = await api.get(`/inquiries/dashboard/leads/${leadId}`);
      if (response.data?.success) {
        const lead = response.data.data;
        setSelectedLead(lead);
        setLeadStatus(lead.status);
        setPrivateNotes(lead.private_notes || '');
      }
    } catch (err: any) {
      alert('Failed to load lead details.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdateLead = async () => {
    if (!selectedLead) return;
    setSaveLoading(true);
    try {
      const response = await api.patch(`/inquiries/dashboard/leads/${selectedLead.id}/`, {
        status: leadStatus,
        private_notes: privateNotes,
      });

      if (response.data?.success) {
        const updatedLead = response.data.data;
        setSelectedLead(updatedLead);
        // Refresh local leads list
        setLeads(leads.map((l) => (l.id === updatedLead.id ? updatedLead : l)));
      }
    } catch (err) {
      alert('Failed to save update.');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto h-[82vh]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold font-outfit text-slate-100 flex items-center gap-2">
            <Inbox className="w-8 h-8 text-primary-400" /> Leads Inbox
          </h1>
          <p className="text-sm text-slate-400 font-jakarta">Review customer inquiries and manage your sales pipeline</p>
        </div>
      </div>

      {/* Main split dashboard panel */}
      <div className="flex-1 flex gap-6 overflow-hidden min-h-0">
        
        {/* Left Side: Filter and Leads list */}
        <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
          {/* Filters Bar */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <PremiumInput
                placeholder="Search leads by name or query..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                startIcon={<Search className="w-4 h-4 text-slate-500" />}
              />
            </div>
            
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900/40 border border-slate-800/80 rounded-xl px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-primary-500 font-jakarta"
              >
                <option value="" className="bg-slate-950">All Statuses</option>
                <option value="new" className="bg-slate-950">New</option>
                <option value="contacted" className="bg-slate-950">Contacted</option>
                <option value="in_discussion" className="bg-slate-950">In Discussion</option>
                <option value="converted" className="bg-slate-950">Converted</option>
                <option value="closed" className="bg-slate-950">Closed</option>
                <option value="rejected" className="bg-slate-950">Rejected</option>
              </select>
              
              <PremiumButton type="submit" variant="secondary" size="md">
                Search
              </PremiumButton>
            </div>
          </form>

          {/* Gating warning for Free users */}
          {isFree && hiddenCount > 0 && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-400 text-xs font-jakarta flex items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>
                  <strong>Gated leads limit:</strong> Free plan only displays the newest 10 leads. You have{' '}
                  <strong>{hiddenCount} hidden leads</strong>.
                </span>
              </div>
              <Link href="/dashboard/billing">
                <PremiumButton variant="primary" size="sm" className="bg-amber-600 hover:bg-amber-500 border-none font-bold text-[10px] uppercase">
                  Upgrade Plan
                </PremiumButton>
              </Link>
            </div>
          )}

          {/* Leads list layout */}
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : leads.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 glass rounded-2xl border border-white/5 text-slate-500 text-sm font-jakarta">
              <Inbox className="w-12 h-12 opacity-30" />
              <span>No leads found matching your criteria.</span>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {leads.map((lead) => {
                const isSelected = selectedLead?.id === lead.id;
                return (
                  <div
                    key={lead.id}
                    onClick={() => handleSelectLead(lead.id)}
                    className={`
                      p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left flex items-center justify-between gap-4
                      ${
                        isSelected
                          ? 'border-primary-500 bg-primary-600/10 shadow-lg shadow-primary-500/5'
                          : 'border-slate-800 bg-slate-900/10 hover:bg-slate-900/30'
                      }
                    `}
                  >
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-200 font-outfit">{lead.sender_name}</span>
                        <span className={`
                          px-2 py-0.5 text-[9px] rounded-full uppercase tracking-wider font-bold font-jakarta
                          ${
                            lead.status === 'new' ? 'bg-primary-500/10 text-primary-400 border border-primary-500/20' :
                            lead.status === 'converted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            'bg-slate-800 text-slate-400 border border-slate-700'
                          }
                        `}>
                          {lead.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-jakarta truncate max-w-md">{lead.message}</p>
                      
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 font-jakarta mt-1">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(lead.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <ChevronRight className={`w-5 h-5 transition-transform ${isSelected ? 'text-primary-400 translate-x-1' : 'text-slate-600'}`} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Lead detail panel */}
        <div className="w-[380px] bg-slate-950 border border-white/5 rounded-2xl flex flex-col overflow-hidden flex-shrink-0">
          {detailLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : !selectedLead ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 font-jakarta text-sm gap-3">
              <Inbox className="w-10 h-10 opacity-30" />
              <span>Select an inquiry from the list to view full details and take action.</span>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-y-auto">
              {/* Detail Header */}
              <div className="p-6 border-b border-white/5 flex justify-between items-start">
                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-slate-100 font-outfit truncate">{selectedLead.sender_name}</h3>
                  <span className="text-[10px] text-slate-500 font-jakarta flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3 h-3" /> Received {new Date(selectedLead.created_at).toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="text-slate-500 hover:text-slate-300 focus:outline-none cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Details Content */}
              <div className="p-6 flex flex-col gap-6 flex-1">
                {/* Contact info list */}
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-outfit">Contact Info</span>
                  <div className="flex flex-col gap-2 text-xs font-jakarta text-slate-300">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-500" />
                      <a href={`mailto:${selectedLead.sender_email}`} className="hover:text-primary-400 transition-colors">
                        {selectedLead.sender_email}
                      </a>
                    </div>
                    {selectedLead.sender_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-500" />
                        <a href={`tel:${selectedLead.sender_phone}`} className="hover:text-primary-400 transition-colors">
                          {selectedLead.sender_phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Message query */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-outfit">Customer Message</span>
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-300 font-jakarta leading-relaxed max-h-[140px] overflow-y-auto">
                    {selectedLead.message}
                  </div>
                </div>

                {/* Status selector */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-outfit">Pipeline Status</span>
                  <select
                    value={leadStatus}
                    onChange={(e) => setLeadStatus(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl px-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-primary-500 font-jakarta"
                  >
                    <option value="new" className="bg-slate-950">New</option>
                    <option value="contacted" className="bg-slate-950">Contacted</option>
                    <option value="in_discussion" className="bg-slate-950">In Discussion</option>
                    <option value="converted" className="bg-slate-950">Converted (Closed Won)</option>
                    <option value="closed" className="bg-slate-950">Closed</option>
                    <option value="rejected" className="bg-slate-950">Rejected</option>
                  </select>
                </div>

                {/* Internal Notes */}
                <div className="flex flex-col gap-2 flex-1 min-h-[120px]">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-outfit">Private Notes (Owner Only)</span>
                  <textarea
                    value={privateNotes}
                    onChange={(e) => setPrivateNotes(e.target.value)}
                    placeholder="Add follow-up notes, phone call logs, pricing quotes..."
                    className="w-full flex-1 bg-slate-900/60 border border-slate-800/80 focus:border-primary-500 rounded-xl p-4 text-xs text-slate-200 focus:outline-none font-jakarta resize-none min-h-[100px]"
                  />
                </div>
              </div>

              {/* Sidebar Action Footer */}
              <div className="p-6 border-t border-white/5 bg-slate-950/80">
                <PremiumButton
                  onClick={handleUpdateLead}
                  isLoading={saveLoading}
                  variant="primary"
                  size="md"
                  glow
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </PremiumButton>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
