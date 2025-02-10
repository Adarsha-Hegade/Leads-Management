export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';
export type InterestLevel = 'High' | 'Medium' | 'Low';
export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface ActivityChecklist {
  initial_call: boolean;
  catalogue_sent: boolean;
  demo_completed: boolean;
  pricing_discussed: boolean;
  proposal_sent: boolean;
}

export interface Interaction {
  date: string;
  type: 'Call' | 'Email' | 'Meeting' | 'Stage Change' | 'Other';
  summary: string;
  action_items: string[];
  notes?: string;
}

export interface Lead {
  id: string;
  name: string;
  phone?: string;
  city?: string;
  email?: string;
  url_slugs?: string[];
  created_at: string;
  lead_type: string;
  device_info?: {
    [key: string]: any;
  };
  location_info?: {
    [key: string]: any;
  };
  comments?: string;
  status: LeadStatus;
  lead_source?: string;
  initial_contact_date?: string;
  last_contact?: string;
  next_followup_date?: string;
  interest_level?: InterestLevel;
  activity_checklist: ActivityChecklist;
  requirements: string[];
  objections: string[];
  next_steps?: string;
  interactions: Interaction[];
  // New tracking fields
  priority?: Priority;
  assigned_to?: string;
  expected_value?: number;
  probability?: number;
  tracking_notes?: string;
  tracking_custom_fields?: {
    activity_checklist?: ActivityChecklist;
    [key: string]: any;
  };
}

export interface LeadStats {
  total: number;
  new: number;
  followUp: number;
  converted: number;
  notInterested: number;
}