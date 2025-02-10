import React from 'react';
import { format } from 'date-fns';
import { User, Phone, Mail } from 'lucide-react';
import type { Lead, LeadStatus } from '../types/lead';

interface KanbanViewProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
}

const STATUSES: LeadStatus[] = ['New', 'Follow-up', 'Interested', 'Converted', 'Not Interested'];

const getStatusColor = (status: LeadStatus) => {
  switch (status) {
    case 'New':
      return 'bg-blue-50 border-blue-200';
    case 'Follow-up':
      return 'bg-yellow-50 border-yellow-200';
    case 'Interested':
      return 'bg-purple-50 border-purple-200';
    case 'Converted':
      return 'bg-green-50 border-green-200';
    case 'Not Interested':
      return 'bg-red-50 border-red-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

export function KanbanView({ leads, onLeadClick }: KanbanViewProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STATUSES.map((status) => {
        const statusLeads = leads.filter((lead) => lead.status === status);
        
        return (
          <div
            key={status}
            className="flex-shrink-0 w-80 bg-gray-50 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">{status}</h3>
              <span className="text-sm text-gray-500">{statusLeads.length}</span>
            </div>
            
            <div className="space-y-3">
              {statusLeads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => onLeadClick(lead)}
                  className={`${getStatusColor(
                    lead.status as LeadStatus
                  )} border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-gray-900">
                        {lead.name}
                      </h4>
                      <p className="text-xs text-gray-500">{lead.lead_type}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      {lead.phone}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      {lead.email}
                    </div>
                  </div>
                  
                  {lead.comments && (
                    <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                      {lead.comments}
                    </p>
                  )}
                  
                  <div className="mt-3 text-xs text-gray-500">
                    Added: {format(new Date(lead.created_at), 'MMM d, yyyy')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}