import React from 'react';
import { format } from 'date-fns';
import { X, User, Phone, MapPin, Mail, Globe, Calendar, Monitor, MessageSquare } from 'lucide-react';
import type { Lead } from '../types/lead';

interface LeadDetailsProps {
  lead: Lead;
  onClose: () => void;
}

export function LeadDetails({ lead, onClose }: LeadDetailsProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold text-gray-900">{lead.name}</h2>
                <p className="text-sm text-gray-500">{lead.lead_type}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-600">{lead.phone}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-600">{lead.email}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-600">{lead.city}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Lead Details</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-600">
                    {format(new Date(lead.created_at), 'PPP')}
                  </span>
                </div>
                <div className="flex items-center">
                  <Globe className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-gray-600">
                    {lead.url_slugs?.join(', ') || 'No URLs'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {(lead.device_info || lead.location_info) && (
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Technical Information</h3>
              <div className="grid grid-cols-2 gap-6">
                {lead.device_info && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Monitor className="w-4 h-4 mr-2" />
                      Device Info
                    </h4>
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                      {JSON.stringify(lead.device_info, null, 2)}
                    </pre>
                  </div>
                )}
                {lead.location_info && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Location Info
                    </h4>
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                      {JSON.stringify(lead.location_info, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {lead.comments && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <MessageSquare className="w-4 h-4 mr-2" />
                Comments
              </h3>
              <p className="text-gray-600 whitespace-pre-wrap">{lead.comments}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}