import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  X, User, Phone, MapPin, Mail, Calendar, MessageSquare,
  Star, Clock, CheckCircle, XCircle, AlertCircle, Plus,
  ChevronRight, MoveRight
} from 'lucide-react';
import type { Lead, LeadStatus, InterestLevel, Interaction } from '../types/lead';

interface LeadDetailsProps {
  lead: Lead;
  onClose: () => void;
  onUpdate?: (lead: Lead) => void;
}

const LEAD_STAGES: LeadStatus[] = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];

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

  const handleStageChange = () => {
    if (!selectedStage || !onUpdate) return;

    const updatedLead: Lead = {
      ...lead,
      status: selectedStage,
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

    onUpdate(updatedLead);
    setShowStageModal(false);
    setSelectedStage(null);
    setStageNote('');
  };

  const handleInterestChange = (interest_level: InterestLevel) => {
    if (onUpdate) {
      onUpdate({ ...lead, interest_level });
    }
  };

  const toggleActivity = (key: keyof Lead['activity_checklist']) => {
    if (onUpdate) {
      onUpdate({
        ...lead,
        activity_checklist: {
          ...lead.activity_checklist,
          [key]: !lead.activity_checklist[key]
        }
      });
    }
  };

  const addInteraction = () => {
    if (!newNote.trim() || !onUpdate) return;

    const interaction: Interaction = {
      date: new Date().toISOString(),
      type: 'Other',
      summary: newNote,
      action_items: []
    };

    onUpdate({
      ...lead,
      interactions: [...lead.interactions, interaction],
      last_contact: new Date().toISOString()
    });

    setNewNote('');
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
                  {lead.interest_level && (
                    <span className={`px-2 py-1 text-sm rounded-full ${
                      lead.interest_level === 'High' ? 'bg-green-100 text-green-800' :
                      lead.interest_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {lead.interest_level} Interest
                    </span>
                  )}
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

        {/* Stage Change Modal */}
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
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        selectedStage === stage
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
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
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStageChange}
                    disabled={!selectedStage}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Change Stage
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'info' && (
            <div className="grid grid-cols-2 gap-6">
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

                <h3 className="text-sm font-semibold text-gray-700 mt-6 mb-3">Important Dates</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-gray-600">
                      Created: {format(new Date(lead.created_at), 'PPP')}
                    </span>
                  </div>
                  {lead.initial_contact_date && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-600">
                        Initial Contact: {format(new Date(lead.initial_contact_date), 'PPP')}
                      </span>
                    </div>
                  )}
                  {lead.next_followup_date && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                      <span className="text-gray-600">
                        Next Follow-up: {format(new Date(lead.next_followup_date), 'PPP')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Requirements & Objections</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm text-gray-600 mb-2">Requirements</h4>
                    {lead.requirements.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {lead.requirements.map((req, i) => (
                          <li key={i} className="text-sm text-gray-600">{req}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No requirements recorded</p>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm text-gray-600 mb-2">Objections</h4>
                    {lead.objections.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-1">
                        {lead.objections.map((obj, i) => (
                          <li key={i} className="text-sm text-gray-600">{obj}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No objections recorded</p>
                    )}
                  </div>

                  {lead.next_steps && (
                    <div>
                      <h4 className="text-sm text-gray-600 mb-2">Next Steps</h4>
                      <p className="text-sm text-gray-600">{lead.next_steps}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Activity Checklist</h3>
                <div className="space-y-2">
                  {Object.entries(lead.activity_checklist).map(([key, value]) => (
                    <label
                      key={key}
                      className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                    >
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={() => toggleActivity(key as keyof Lead['activity_checklist'])}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-sm text-gray-700">
                        {key.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </span>
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
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Note
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
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
        </div>
      </div>
    </div>
  );
}