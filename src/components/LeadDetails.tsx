import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  X, User, Phone, MapPin, Mail, Calendar, MessageSquare,
  Star, Clock, CheckCircle, XCircle, AlertCircle, Plus,
  ChevronRight, MoveRight, DollarSign, Percent
} from 'lucide-react';
import type { Lead, LeadStatus, Priority, LeadTracking } from '../types/lead';

interface LeadDetailsProps {
  lead: Lead;
  onClose: () => void;
  onUpdate?: (lead: Lead) => void;
}

const LEAD_STAGES: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];
const PRIORITIES: Priority[] = ['Low', 'Medium', 'High', 'Urgent'];

const STATUS_ICONS: Record<LeadStatus, React.ReactNode> = {
  'New': <Star className="text-blue-500" />,
  'Contacted': <Clock className="text-yellow-500" />,
  'Qualified': <CheckCircle className="text-green-500" />,
  'Proposal': <AlertCircle className="text-purple-500" />,
  'Negotiation': <Clock className="text-orange-500" />,
  'Won': <CheckCircle className="text-emerald-500" />,
  'Lost': <XCircle className="text-red-500" />
};

const getStageColor = (status: LeadStatus) => {
  switch (status) {
    case 'New':
      return 'bg-blue-100 text-blue-800';
    case 'Contacted':
      return 'bg-yellow-100 text-yellow-800';
    case 'Qualified':
      return 'bg-green-100 text-green-800';
    case 'Proposal':
      return 'bg-purple-100 text-purple-800';
    case 'Negotiation':
      return 'bg-orange-100 text-orange-800';
    case 'Won':
      return 'bg-emerald-100 text-emerald-800';
    case 'Lost':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function LeadDetails({ lead, onClose, onUpdate }: LeadDetailsProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'activity' | 'history'>('info');
  const [newNote, setNewNote] = useState('');
  const [showStageModal, setShowStageModal] = useState(false);
  const [selectedStage, setSelectedStage] = useState<LeadStatus | null>(null);
  const [stageNote, setStageNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [leadData, setLeadData] = useState<Partial<Lead>>({
    priority: lead.priority || 'Medium',
    expected_value: lead.expected_value || 0,
    probability: lead.probability || 0,
    tracking_notes: lead.tracking_notes || '',
    next_followup_date: lead.next_followup_date || '',
    last_contact: lead.last_contact || ''
  });

  const handleLeadChange = (field: keyof Lead, value: any) => {
    setLeadData(prev => ({ ...prev, [field]: value }));
  };

  const handleStageChange = async () => {
    if (!selectedStage || !onUpdate) return;

    setIsUpdating(true);
    try {
      const updatedLead: Lead = {
        ...lead,
        ...leadData,
        status: selectedStage,
        tracking_notes: stageNote || leadData.tracking_notes,
        interactions: [
          ...lead.interactions,
          {
            date: new Date().toISOString(),
            type: 'Stage Change',
            summary: `Stage changed from ${lead.status} to ${selectedStage}`,
            notes: stageNote,
            action_items: []
          }
        ]
      };

      await onUpdate(updatedLead);
    } finally {
      setIsUpdating(false);
      setShowStageModal(false);
      setSelectedStage(null);
      setStageNote('');
    }
  };

  const toggleActivity = async (key: keyof Lead['activity_checklist']) => {
    if (!onUpdate || isUpdating) return;

    setIsUpdating(true);
    try {
      const updatedChecklist = {
        ...lead.activity_checklist,
        [key]: !lead.activity_checklist[key]
      };

      const updatedLead: Lead = {
        ...lead,
        ...leadData,
        activity_checklist: updatedChecklist,
        tracking_custom_fields: {
          ...lead.tracking_custom_fields,
          activity_checklist: updatedChecklist
        }
      };

      await onUpdate(updatedLead);
    } finally {
      setIsUpdating(false);
    }
  };

  const addInteraction = async () => {
    if (!newNote.trim() || !onUpdate || isUpdating) return;

    setIsUpdating(true);
    try {
      const now = new Date().toISOString();
      const interaction = {
        date: now,
        type: 'Other' as const,
        summary: newNote,
        action_items: []
      };

      const updatedLead: Lead = {
        ...lead,
        ...leadData,
        interactions: [...lead.interactions, interaction],
        last_contact: now,
        tracking_notes: `${leadData.tracking_notes ? leadData.tracking_notes + '\n' : ''}${newNote}`
      };

      await onUpdate(updatedLead);
      setNewNote('');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                {STATUS_ICONS[lead.status] || <User className="w-6 h-6 text-blue-600" />}
              </div>
              <div className="ml-4">
                <h2 className="text-2xl font-bold text-gray-900">{lead.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => setShowStageModal(true)}
                    className={`px-3 py-1 text-sm rounded-full flex items-center gap-2 transition-colors ${getStageColor(lead.status)} hover:opacity-90`}
                  >
                    {lead.status}
                    <MoveRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-4 px-6">
            {(['info', 'activity', 'history'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-2 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'info' && (
          <div className="grid grid-cols-2 gap-6 p-6">
            <div>
              {/* Contact Information */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Contact Information</h3>
                <div className="space-y-3">
                  {lead.phone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-600">{lead.phone}</span>
                    </div>
                  )}
                  {lead.email && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-600">{lead.email}</span>
                    </div>
                  )}
                  {lead.city && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-600">{lead.city}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Lead Tracking */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Lead Tracking</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={leadData.priority}
                      onChange={(e) => handleLeadChange('priority', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {PRIORITIES.map(priority => (
                        <option key={priority} value={priority}>{priority}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expected Value
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="number"
                        value={leadData.expected_value || ''}
                        onChange={(e) => handleLeadChange('expected_value', parseFloat(e.target.value))}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Probability
                    </label>
                    <div className="relative">
                      <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={leadData.probability || ''}
                        onChange={(e) => handleLeadChange('probability', parseInt(e.target.value))}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Next Follow-up
                    </label>
                    <input
                      type="datetime-local"
                      value={leadData.next_followup_date ? new Date(leadData.next_followup_date).toISOString().slice(0, 16) : ''}
                      onChange={(e) => handleLeadChange('next_followup_date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Notes</h3>
              <textarea
                value={leadData.tracking_notes || ''}
                onChange={(e) => handleLeadChange('tracking_notes', e.target.value)}
                className="w-full h-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add notes about this lead..."
              />
            </div>
          </div>
        )}

        {/* Activity tab */}
        {activeTab === 'activity' && (
          <div className="space-y-6 p-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Activity Checklist</h3>
              <div className="space-y-2">
                {Object.entries(lead.activity_checklist).map(([key, value]) => (
                  <label
                    key={key}
                    className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 relative"
                  >
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => toggleActivity(key as keyof Lead['activity_checklist'])}
                      disabled={isUpdating}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      {key.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </span>
                    {isUpdating && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Add Note</h3>
              <div className="space-y-3">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Enter your notes here..."
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={addInteraction}
                  disabled={isUpdating}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Note
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* History tab */}
        {activeTab === 'history' && (
          <div className="space-y-4 p-6">
            {lead.interactions.length > 0 ? (
              lead.interactions.map((interaction, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {format(new Date(interaction.date), 'PPP')}
                    </span>
                    <span className="text-sm text-gray-500">{interaction.type}</span>
                  </div>
                  <p className="text-gray-600 mb-2">{interaction.summary}</p>
                  {interaction.action_items.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Action Items:</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {interaction.action_items.map((item, i) => (
                          <li key={i} className="text-sm text-gray-600">{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {interaction.notes && (
                    <p className="mt-2 text-sm text-gray-500">{interaction.notes}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No interaction history available</p>
            )}
          </div>
        )}

        {/* Stage change modal */}
        {showStageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Lead Stage</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-2">
                  {LEAD_STAGES.map((stage) => (
                    <button
                      key={stage}
                      onClick={() => setSelectedStage(stage)}
                      disabled={isUpdating}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        selectedStage === stage
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        {STATUS_ICONS[stage]}
                        <span className="font-medium">{stage}</span>
                      </div>
                      {selectedStage === stage && (
                        <ChevronRight className="w-5 h-5 text-blue-500" />
                      )}
                    </button>
                  ))}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    value={stageNote}
                    onChange={(e) => setStageNote(e.target.value)}
                    disabled={isUpdating}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Add any notes about this stage change..."
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowStageModal(false);
                      setSelectedStage(null);
                      setStageNote('');
                    }}
                    disabled={isUpdating}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStageChange}
                    disabled={!selectedStage || isUpdating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isUpdating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Updating...
                      </>
                    ) : (
                      'Change Stage'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}