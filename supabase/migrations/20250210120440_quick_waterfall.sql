/*
  # Merge tracking data into leads table
  
  1. Changes
    - Add tracking columns to leads table
    - Migrate existing tracking data
    - Drop leads_tracking table
  
  2. New Columns
    - priority
    - assigned_to
    - expected_value
    - probability
    - tracking_notes
    - tracking_custom_fields
*/

-- Add new columns to leads table
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS priority text CHECK (
  priority IN ('Low', 'Medium', 'High', 'Urgent')
),
ADD COLUMN IF NOT EXISTS assigned_to uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS expected_value numeric(12,2),
ADD COLUMN IF NOT EXISTS probability integer CHECK (probability >= 0 AND probability <= 100),
ADD COLUMN IF NOT EXISTS tracking_notes text,
ADD COLUMN IF NOT EXISTS tracking_custom_fields jsonb DEFAULT '{}'::jsonb;

-- Migrate existing tracking data
DO $$ 
BEGIN
  -- Update leads with tracking data
  UPDATE leads l
  SET 
    priority = t.priority,
    assigned_to = t.assigned_to,
    expected_value = t.expected_value,
    probability = t.probability,
    tracking_notes = t.notes,
    tracking_custom_fields = t.custom_fields
  FROM leads_tracking t
  WHERE l.id = t.lead_id;

  -- Drop leads_tracking table and related objects
  DROP TABLE IF EXISTS leads_tracking_history;
  DROP TABLE IF EXISTS leads_tracking;
END $$;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_probability ON leads(probability);