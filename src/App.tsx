// import React, { useEffect, useState } from 'react';
// import { Search, Filter } from 'lucide-react';
// import { supabase, signOut, getCurrentUser, updateLead } from './lib/supabase';
// import { LeadCard } from './components/LeadCard';
// import { LeadDetails } from './components/LeadDetails';
// import { DashboardStats } from './components/DashboardStats';
// import { TimeFilter } from './components/TimeFilter';
// import { ViewToggle, ViewType } from './components/ViewToggle';
// import { ListView } from './components/ListView';
// import { Auth } from './components/Auth';
// import { debugLog, DEBUG_LEVELS } from './lib/debug';
// import type { Lead, LeadStats } from './types/lead';

// function App() {
//   const [leads, setLeads] = useState<Lead[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
//   const [filterType, setFilterType] = useState<string>('all');
//   const [timeRange, setTimeRange] = useState<string>('all');
//   const [viewType, setViewType] = useState<ViewType>('grid');
//   const [user, setUser] = useState(null);
//   const [authChecked, setAuthChecked] = useState(false);

//   useEffect(() => {
//     checkUser();
//   }, []);

//   useEffect(() => {
//     if (user) {
//       fetchLeads();
//     }
//   }, [timeRange, user]);

//   async function checkUser() {
//     try {
//       const currentUser = await getCurrentUser();
//       setUser(currentUser);
//     } catch (err) {
//       console.error('Error checking user:', err);
//     } finally {
//       setAuthChecked(true);
//     }
//   }

//   async function fetchLeads() {
//     debugLog(DEBUG_LEVELS.DB, 'Fetching leads');
    
//     try {
//       let query = supabase
//         .from('leads')
//         .select('*')
//         .order('created_at', { ascending: false });

//       if (timeRange !== 'all') {
//         const now = new Date();
//         let timeAgo;
        
//         switch (timeRange) {
//           case '12h':
//             timeAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
//             break;
//           case '24h':
//             timeAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
//             break;
//           case '7d':
//             timeAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
//             break;
//           case '30d':
//             timeAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
//             break;
//         }

//         if (timeAgo) {
//           debugLog(DEBUG_LEVELS.INFO, 'Applying time filter', { timeRange, timeAgo });
//           query = query.gte('created_at', timeAgo.toISOString());
//         }
//       }

//       debugLog(DEBUG_LEVELS.DB, 'Executing leads query');
//       const { data: leadsData, error: leadsError } = await query;

//       if (leadsError) {
//         debugLog(DEBUG_LEVELS.ERROR, 'Error fetching leads', leadsError);
//         throw leadsError;
//       }

//       debugLog(DEBUG_LEVELS.INFO, 'Leads fetched successfully', { 
//         count: leadsData?.length 
//       });

//       const transformedLeads = leadsData.map(lead => ({
//         ...lead,
//         activity_checklist: lead.tracking_custom_fields?.activity_checklist || {
//           initial_call: false,
//           catalogue_sent: false,
//           demo_completed: false,
//           pricing_discussed: false,
//           proposal_sent: false
//         },
//         interactions: lead.interactions || []
//       }));

//       debugLog(DEBUG_LEVELS.INFO, 'Leads transformed', { 
//         count: transformedLeads.length 
//       });

//       setLeads(transformedLeads);
//       setError(null);
//     } catch (err) {
//       const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching leads';
//       debugLog(DEBUG_LEVELS.ERROR, 'Error in fetchLeads', err);
//       setError(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   }

//   async function handleLeadUpdate(updatedLead: Lead) {
//     debugLog(DEBUG_LEVELS.DB, 'Updating lead', { leadId: updatedLead.id });
    
//     try {
//       // Prepare the data for update
//       const updateData = {
//         status: updatedLead.status,
//         priority: updatedLead.priority,
//         assigned_to: updatedLead.assigned_to,
//         last_contact: updatedLead.last_contact,
//         next_followup_date: updatedLead.next_followup_date,
//         expected_value: updatedLead.expected_value,
//         probability: updatedLead.probability,
//         tracking_notes: updatedLead.tracking_notes,
//         tracking_custom_fields: {
//           activity_checklist: updatedLead.activity_checklist,
//           ...(updatedLead.tracking_custom_fields || {})
//         },
//         interactions: updatedLead.interactions
//       };
//       debugLog(DEBUG_LEVELS.DB, 'Sending update to database', updateData);

//       await updateLead(updatedLead.id, updateData);

//       debugLog(DEBUG_LEVELS.INFO, 'Lead updated successfully', { leadId: updatedLead.id });

//       // Update the local state
//       setLeads(prevLeads => 
//         prevLeads.map(lead => 
//           lead.id === updatedLead.id ? updatedLead : lead
//         )
//       );

//       // If the updated lead is currently selected, update it
//       if (selectedLead?.id === updatedLead.id) {
//         setSelectedLead(updatedLead);
//       }

//       // Refresh the leads to ensure we have the latest data
//       await fetchLeads();
//     } catch (err) {
//       debugLog(DEBUG_LEVELS.ERROR, 'Error in handleLeadUpdate', err);
//       setError(err instanceof Error ? err.message : 'An error occurred while updating the lead');
//     }
//   }

//   const handleSignOut = async () => {
//     try {
//       await signOut();
//       setUser(null);
//       setLeads([]);
//     } catch (err) {
//       console.error('Error signing out:', err);
//     }
//   };

//   const filteredLeads = leads.filter(lead => {
//     const matchesSearch = 
//       (lead.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
//       (lead.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
//       (lead.phone || '').includes(searchTerm) ||
//       (lead.city?.toLowerCase() || '').includes(searchTerm.toLowerCase());

//     const matchesFilter = 
//       filterType === 'all' || 
//       (lead.lead_type?.toLowerCase() || '') === filterType.toLowerCase();

//     return matchesSearch && matchesFilter;
//   });

//   const leadTypes = Array.from(new Set(leads.map(lead => lead.lead_type || 'Unknown')));

//   const stats: LeadStats = {
//     total: filteredLeads.length,
//     new: filteredLeads.filter(lead => lead.status === 'New').length,
//     followUp: filteredLeads.filter(lead => lead.status === 'Contacted').length,
//     converted: filteredLeads.filter(lead => lead.status === 'Won').length,
//     notInterested: filteredLeads.filter(lead => lead.status === 'Lost').length,
//   };

//   if (!authChecked) {
//     return <div>Loading...</div>;
//   }

//   if (!user) {
//     return <Auth onSuccess={checkUser} />;
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="max-w-7xl mx-auto px-4 py-8">
//         <div className="flex justify-between items-center mb-8">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900 mb-2">Lead Management</h1>
//             <p className="text-gray-600">
//               {loading ? 'Loading leads...' : `${filteredLeads.length} leads found`}
//             </p>
//           </div>
//           <button
//             onClick={handleSignOut}
//             className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
//           >
//             Sign Out
//           </button>
//         </div>

//         <DashboardStats stats={stats} />

//         <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
//           <div className="flex flex-col md:flex-row md:items-center gap-4">
//             <div className="flex-1 relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//               <input
//                 type="text"
//                 placeholder="Search leads..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
            
//             <div className="flex items-center gap-4">
//               <TimeFilter value={timeRange} onChange={setTimeRange} />
//               <div className="relative">
//                 <select
//                   value={filterType}
//                   onChange={(e) => setFilterType(e.target.value)}
//                   className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 >
//                   <option value="all">All Types</option>
//                   {leadTypes.map(type => (
//                     <option key={type} value={type}>{type}</option>
//                   ))}
//                 </select>
//                 <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
//               </div>
//               <ViewToggle currentView={viewType} onViewChange={setViewType} />
//             </div>
//           </div>
//         </div>

//         {loading ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {[...Array(6)].map((_, i) => (
//               <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
//                 <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
//                 <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
//                 <div className="h-4 bg-gray-200 rounded w-5/6"></div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <>
//             {viewType === 'list' ? (
//               <ListView leads={filteredLeads} onLeadClick={setSelectedLead} />
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {filteredLeads.map(lead => (
//                   <LeadCard
//                     key={lead.id}
//                     lead={lead}
//                     onClick={setSelectedLead}
//                   />
//                 ))}
//               </div>
//             )}

//             {filteredLeads.length === 0 && (
//               <div className="text-center py-12">
//                 <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
//                 <p className="text-gray-600">Try adjusting your search or filters</p>
//               </div>
//             )}
//           </>
//         )}
//       </div>

//       {selectedLead && (
//         <LeadDetails
//           lead={selectedLead}
//           onClose={() => setSelectedLead(null)}
//           onUpdate={handleLeadUpdate}
//         />
//       )}

//       {error && (
//         <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg">
//           <p className="font-medium">Error</p>
//           <p className="text-sm">{error}</p>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;



import React, { useEffect, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { supabase, signOut, getCurrentUser, updateLead } from './lib/supabase';
import { LeadCard } from './components/LeadCard';
import { LeadDetails } from './components/LeadDetails';
import { DashboardStats } from './components/DashboardStats';
import { TimeFilter } from './components/TimeFilter';
import { ViewToggle, ViewType } from './components/ViewToggle';
import { ListView } from './components/ListView';
import { Auth } from './components/Auth';
import { debugLog, DEBUG_LEVELS } from './lib/debug';
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
    debugLog(DEBUG_LEVELS.DB, 'Fetching leads');

    try {
      let query = supabase
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
          debugLog(DEBUG_LEVELS.INFO, 'Applying time filter', { timeRange, timeAgo });
          query = query.gte('created_at', timeAgo.toISOString());
        }
      }

      debugLog(DEBUG_LEVELS.DB, 'Executing leads query');
      const { data: leadsData, error: leadsError } = await query;

      if (leadsError) {
        debugLog(DEBUG_LEVELS.ERROR, 'Error fetching leads', leadsError);
        throw leadsError;
      }

      debugLog(DEBUG_LEVELS.INFO, 'Leads fetched successfully', {
        count: leadsData?.length,
      });

      const transformedLeads = leadsData.map((lead) => ({
        ...lead,
        activity_checklist: lead.tracking_custom_fields?.activity_checklist || {
          initial_call: false,
          catalogue_sent: false,
          demo_completed: false,
          pricing_discussed: false,
          proposal_sent: false,
        },
        interactions: lead.interactions ? JSON.parse(lead.interactions) : [], // Parse JSON string to array
      }));

      debugLog(DEBUG_LEVELS.INFO, 'Leads transformed', {
        count: transformedLeads.length,
      });

      setLeads(transformedLeads);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred while fetching leads';
      debugLog(DEBUG_LEVELS.ERROR, 'Error in fetchLeads', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleLeadUpdate(updatedLead: Lead) {
    debugLog(DEBUG_LEVELS.DB, 'Updating lead', { leadId: updatedLead.id });

    try {
      // Validate and clean timestamp fields
      const cleanLastContact =
        updatedLead.last_contact && updatedLead.last_contact.trim() !== ''
          ? updatedLead.last_contact
          : null;
      const cleanNextFollowupDate =
        updatedLead.next_followup_date && updatedLead.next_followup_date.trim() !== ''
          ? updatedLead.next_followup_date
          : null;

      // Prepare the data for update
      const updateData = {
        status: updatedLead.status,
        priority: updatedLead.priority,
        assigned_to: updatedLead.assigned_to,
        last_contact: cleanLastContact, // Use cleaned value
        next_followup_date: cleanNextFollowupDate, // Use cleaned value
        expected_value: updatedLead.expected_value,
        probability: updatedLead.probability,
        tracking_notes: updatedLead.tracking_notes,
        tracking_custom_fields: {
          activity_checklist: updatedLead.activity_checklist,
          ...(updatedLead.tracking_custom_fields || {}),
        },
        interactions: JSON.stringify(updatedLead.interactions), // Convert array to string
      };

      debugLog(DEBUG_LEVELS.DB, 'Sending update to database', updateData);

      await updateLead(updatedLead.id, updateData);

      debugLog(DEBUG_LEVELS.INFO, 'Lead updated successfully', { leadId: updatedLead.id });

      // Update the local state
      setLeads((prevLeads) =>
        prevLeads.map((lead) =>
          lead.id === updatedLead.id ? updatedLead : lead
        )
      );

      // If the updated lead is currently selected, update it
      if (selectedLead?.id === updatedLead.id) {
        setSelectedLead(updatedLead);
      }

      // Refresh the leads to ensure we have the latest data
      await fetchLeads();
    } catch (err) {
      debugLog(DEBUG_LEVELS.ERROR, 'Error in handleLeadUpdate', err);
      setError(
        err instanceof Error ? err.message : 'An error occurred while updating the lead'
      );
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

  const filteredLeads = leads.filter((lead) => {
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

  const leadTypes = Array.from(new Set(leads.map((lead) => lead.lead_type || 'Unknown')));

  const stats: LeadStats = {
    total: filteredLeads.length,
    new: filteredLeads.filter((lead) => lead.status === 'New').length,
    followUp: filteredLeads.filter((lead) => lead.status === 'Contacted').length,
    converted: filteredLeads.filter((lead) => lead.status === 'Won').length,
    notInterested: filteredLeads.filter((lead) => lead.status === 'Lost').length,
  };

  if (!authChecked) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Auth onSuccess={checkUser} />;
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
                  {leadTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
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
            {viewType === 'list' ? (
              <ListView leads={filteredLeads} onLeadClick={setSelectedLead} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLeads.map((lead) => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    onClick={setSelectedLead}
                  />
                ))}
              </div>
            )}

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

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}

export default App;