import React, { useEffect, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { supabase, signOut, getCurrentUser } from './lib/supabase';
import { LeadCard } from './components/LeadCard';
import { LeadDetails } from './components/LeadDetails';
import { DashboardStats } from './components/DashboardStats';
import { TimeFilter } from './components/TimeFilter';
import { ViewToggle, ViewType } from './components/ViewToggle';
import { ListView } from './components/ListView';
import { Auth } from './components/Auth';
import type { Lead, LeadStats } from './types/lead';

function App() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('all');
  const [viewType, setViewType] = useState<ViewType>('grid');
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchLeads();
    }
  }, [timeRange, user]);
  async function checkUser() {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (err) {
      console.error('Error checking user:', err);
    } finally {
      setAuthChecked(true);
    }
  }
  async function fetchLeads() {
    try {
      // First, get all leads
      let leadsQuery = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (timeRange !== 'all') {
        const now = new Date();
        let timeAgo;
        
        switch (timeRange) {
          case '12h':
            timeAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
            break;
          case '24h':
            timeAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
            break;
          case '7d':
            timeAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case '30d':
            timeAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
        }

        if (timeAgo) {
          leadsQuery = leadsQuery.gte('created_at', timeAgo.toISOString());
        }
      }

      const { data: leadsData, error: leadsError } = await leadsQuery;

      if (leadsError) throw leadsError;

      // Then, get tracking data for the current user
      const { data: trackingData, error: trackingError } = await supabase
        .from('leads_tracking')
        .select(`
          *,
          leads_tracking_history (
            changed_fields,
            previous_values,
            new_values,
            changed_at
          )
        `)
        .eq('user_id', user.id);

      if (trackingError) throw trackingError;

      // Merge leads with their tracking data
      const mergedLeads = leadsData.map(lead => {
        const tracking = trackingData?.find(t => t.lead_id === lead.id);
        
        // Convert tracking history to interactions
        const interactions = tracking?.leads_tracking_history?.map(history => ({
          date: history.changed_at,
          type: 'Stage Change',
          summary: `Changed from ${history.previous_values.status || 'New'} to ${history.new_values.status}`,
          notes: history.new_values.notes || '',
          action_items: []
        })) || [];

        return {
          ...lead,
          status: tracking?.status || 'New',
          comments: tracking?.notes || '',
          last_contact: tracking?.last_contact_date,
          next_followup_date: tracking?.next_follow_up,
          interest_level: tracking?.priority?.toLowerCase(),
          activity_checklist: tracking?.custom_fields?.activity_checklist || {
            initial_call: false,
            catalogue_sent: false,
            demo_completed: false,
            pricing_discussed: false,
            proposal_sent: false
          },
          interactions
        };
      });

      setLeads(mergedLeads);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching leads');
    } finally {
      setLoading(false);
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      setLeads([]);
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const handleLeadUpdate = async (updatedLead: Lead) => {
    try {
      // Update or insert tracking data
      const { data: existingTracking } = await supabase
        .from('leads_tracking')
        .select('id, status, notes')
        .eq('lead_id', updatedLead.id)
        .eq('user_id', user.id)
        .single();

      const trackingData = {
        lead_id: updatedLead.id,
        user_id: user.id,
        status: updatedLead.status,
        priority: updatedLead.interest_level?.toUpperCase(),
        last_contact_date: updatedLead.last_contact,
        next_follow_up: updatedLead.next_followup_date,
        notes: updatedLead.comments,
        custom_fields: {
          activity_checklist: updatedLead.activity_checklist
        }
      };

      if (existingTracking) {
        // Only update if there are actual changes
        if (
          existingTracking.status !== updatedLead.status ||
          existingTracking.notes !== updatedLead.comments
        ) {
          const { error } = await supabase
            .from('leads_tracking')
            .update(trackingData)
            .eq('id', existingTracking.id);

          if (error) throw error;
        }
      } else {
        const { error } = await supabase
          .from('leads_tracking')
          .insert([trackingData]);

        if (error) throw error;
      }

      // Refresh leads after update
      await fetchLeads();
      
      if (selectedLead?.id === updatedLead.id) {
        const updatedLeadData = leads.find(l => l.id === updatedLead.id);
        setSelectedLead(updatedLeadData || null);
      }
    } catch (err) {
      console.error('Error updating lead:', err);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      (lead.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (lead.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (lead.phone || '').includes(searchTerm) ||
      (lead.city?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesFilter = 
      filterType === 'all' || 
      (lead.lead_type?.toLowerCase() || '') === filterType.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  const leadTypes = Array.from(new Set(leads.map(lead => lead.lead_type || 'Unknown')));

  const stats: LeadStats = {
    total: filteredLeads.length,
    new: filteredLeads.filter(lead => lead.status === 'New').length,
    followUp: filteredLeads.filter(lead => lead.status === 'Contacted').length,
    converted: filteredLeads.filter(lead => lead.status === 'Won').length,
    notInterested: filteredLeads.filter(lead => lead.status === 'Lost').length,
  };

  if (!authChecked) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Auth onSuccess={checkUser} />;
  }

  const renderLeadsView = () => {
    switch (viewType) {
      case 'list':
        return <ListView leads={filteredLeads} onLeadClick={setSelectedLead} />;
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLeads.map(lead => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onClick={setSelectedLead}
              />
            ))}
          </div>
        );
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <h2 className="text-red-600 text-lg font-semibold mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Lead Management</h1>
            <p className="text-gray-600">
              {loading ? 'Loading leads...' : `${filteredLeads.length} leads found`}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Sign Out
          </button>
        </div>

        <DashboardStats stats={stats} />

        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <TimeFilter value={timeRange} onChange={setTimeRange} />
              <div className="relative">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  {leadTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
              <ViewToggle currentView={viewType} onViewChange={setViewType} />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {renderLeadsView()}

            {filteredLeads.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            )}
          </>
        )}
      </div>

      {selectedLead && (
        <LeadDetails
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={handleLeadUpdate}
        />
      )}
    </div>
  );
}

export default App;