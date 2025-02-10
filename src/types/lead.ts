export type LeadStatus = 'New' | 'In Progress' | 'Pending Follow-up' | 'Qualified' | 'Lost';
export type InterestLevel = 'High' | 'Medium' | 'Low';

export interface ActivityChecklist {
  initial_call: boolean;
  catalogue_sent: boolean;
  demo_completed: boolean;
  pricing_discussed: boolean;
  proposal_sent: boolean;
}

export interface Interaction {
  date: string;
  type: 'Call' | 'Email' | 'Meeting' | 'Other';
  summary: string;
  action_items: string[];
  notes?: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  city: string;
  email: string;
  url_slugs: string[];
  created_at: string;
  lead_type: string;
  device_info: {
    [key: string]: any;
  };
  location_info: {
    [key: string]: any;
  };
  comments: string;
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
}

export interface LeadStats {
  total: number;
  new: number;
  inProgress: number;
  pendingFollowup: number;
  qualified: number;
  lost: number;
}