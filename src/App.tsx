import React, { useEffect, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { supabase } from './lib/supabase';
import { LeadCard } from './components/LeadCard';
import { LeadDetails } from './components/LeadDetails';
import { DashboardStats } from './components/DashboardStats';
import { TimeFilter } from './components/TimeFilter';
import type { Lead, LeadStats } from './types/lead';

function App() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('all');

  useEffect(() => {
    fetchLeads();
  }, [timeRange]);

  async function fetchLeads() {
    try {
      let query = supabase
        .from('leads')
        .select('*');

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
          query = query.gte('created_at', timeAgo.toISOString());
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data received from Supabase');
      }

      setLeads(data);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while fetching leads');
    } finally {
      setLoading(false);
    }
  }

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
    followUp: filteredLeads.filter(lead => lead.status === 'Follow-up').length,
    converted: filteredLeads.filter(lead => lead.status === 'Converted').length,
    notInterested: filteredLeads.filter(lead => lead.status === 'Not Interested').length,
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lead Management</h1>
          <p className="text-gray-600">
            {loading ? 'Loading leads...' : `${filteredLeads.length} leads found`}
          </p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLeads.map(lead => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onClick={setSelectedLead}
                />
              ))}
            </div>

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
        />
      )}
    </div>
  );
}

export default App;