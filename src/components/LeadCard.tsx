import React from 'react';
import { format } from 'date-fns';
import { User, Phone, MapPin, Mail, Globe, Calendar, Monitor, MessageSquare } from 'lucide-react';
import type { Lead } from '../types/lead';

interface LeadCardProps {
  lead: Lead;
  onClick: (lead: Lead) => void;
}

const getStageColor = (status: string) => {
  switch (status) {
    case 'New':
      return 'border-blue-200 bg-blue-50';
    case 'Contacted':
      return 'border-yellow-200 bg-yellow-50';
    case 'Qualified':
      return 'border-green-200 bg-green-50';
    case 'Proposal':
      return 'border-purple-200 bg-purple-50';
    case 'Negotiation':
      return 'border-orange-200 bg-orange-50';
    case 'Won':
      return 'border-emerald-200 bg-emerald-50';
    case 'Lost':
      return 'border-red-200 bg-red-50';
    default:
      return 'border-gray-200 bg-white';
  }
};

export function LeadCard({ lead, onClick }: LeadCardProps) {
  return (
    <div 
      onClick={() => onClick(lead)}
      className={`rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border ${getStageColor(lead.status)}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="font-semibold text-lg text-gray-900">{lead.name}</h3>
            <p className="text-sm text-gray-500">{lead.lead_type}</p>
          </div>
        </div>
        <span className="text-sm text-gray-500">
          {format(new Date(lead.created_at), 'MMM d, yyyy')}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {lead.phone && (
          <div className="flex items-center">
            <Phone className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">{lead.phone}</span>
          </div>
        )}
        {lead.city && (
          <div className="flex items-center">
            <MapPin className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">{lead.city}</span>
          </div>
        )}
        {lead.email && (
          <div className="flex items-center">
            <Mail className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">{lead.email}</span>
          </div>
        )}
        {lead.url_slugs && lead.url_slugs.length > 0 && (
          <div className="flex items-center">
            <Globe className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">
              {lead.url_slugs.length} URLs
            </span>
          </div>
        )}
      </div>
      
      {lead.comments && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-start">
            <MessageSquare className="w-4 h-4 text-gray-400 mr-2 mt-1" />
            <p className="text-sm text-gray-600 line-clamp-2">{lead.comments}</p>
          </div>
        </div>
      )}
    </div>
  );
}