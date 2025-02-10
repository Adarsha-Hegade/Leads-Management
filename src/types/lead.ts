export type LeadStatus = 'New' | 'Follow-up' | 'Interested' | 'Converted' | 'Not Interested';

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
  status?: LeadStatus;
  last_contact?: string;
  notes?: string[];
  sales_value?: number;
  conversion_date?: string;
}

export interface LeadStats {
  total: number;
  new: number;
  followUp: number;
  converted: number;
  notInterested: number;
}