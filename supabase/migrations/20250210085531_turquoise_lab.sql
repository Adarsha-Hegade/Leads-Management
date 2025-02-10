/*
  # Leads Tracking System Implementation

  1. New Tables
    - `leads_tracking`
      - Primary tracking table for lead status and metrics
      - Links to existing leads table
      - Includes audit fields and ownership data
    
    - `leads_tracking_history`
      - Audit log for all tracking changes
      - Maintains complete history of updates

  2. Security
    - RLS policies for data access
    - Ownership-based permissions
    
  3. Indexes
    - Optimized for UUID lookups
    - Performance-focused compound indexes
*/

-- Create leads tracking table
CREATE TABLE IF NOT EXISTS leads_tracking (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id),
    status text NOT NULL CHECK (status IN ('New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost')),
    priority text CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
    assigned_to uuid REFERENCES auth.users(id),
    last_contact_date timestamptz,
    next_follow_up timestamptz,
    expected_value numeric(12,2),
    probability integer CHECK (probability >= 0 AND probability <= 100),
    notes text,
    custom_fields jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(lead_id, user_id)
);

-- Create tracking history table for audit logging
CREATE TABLE IF NOT EXISTS leads_tracking_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_id uuid NOT NULL REFERENCES leads_tracking(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id),
    changed_fields jsonb NOT NULL,
    previous_values jsonb NOT NULL,
    new_values jsonb NOT NULL,
    changed_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_tracking_lead_id ON leads_tracking(lead_id);
CREATE INDEX IF NOT EXISTS idx_leads_tracking_user_id ON leads_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_tracking_assigned_to ON leads_tracking(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_tracking_status ON leads_tracking(status);
CREATE INDEX IF NOT EXISTS idx_leads_tracking_next_follow_up ON leads_tracking(next_follow_up);
CREATE INDEX IF NOT EXISTS idx_tracking_history_tracking_id ON leads_tracking_history(tracking_id);

-- Enable RLS
ALTER TABLE leads_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads_tracking_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for leads_tracking
CREATE POLICY "Users can view their own leads tracking"
    ON leads_tracking
    FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid() OR 
        assigned_to = auth.uid()
    );

CREATE POLICY "Users can insert their own leads tracking"
    ON leads_tracking
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own leads tracking"
    ON leads_tracking
    FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own leads tracking"
    ON leads_tracking
    FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- Create RLS policies for leads_tracking_history
CREATE POLICY "Users can view their leads history"
    ON leads_tracking_history
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updating timestamp
CREATE TRIGGER update_leads_tracking_updated_at
    BEFORE UPDATE ON leads_tracking
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to log changes
CREATE OR REPLACE FUNCTION log_leads_tracking_changes()
RETURNS TRIGGER AS $$
DECLARE
    changed_fields jsonb;
    previous_values jsonb;
    new_values jsonb;
BEGIN
    changed_fields = jsonb_object_agg(key, true)
    FROM (
        SELECT key
        FROM jsonb_each(row_to_json(NEW)::jsonb)
        WHERE row_to_json(NEW)::jsonb->key != row_to_json(OLD)::jsonb->key
    ) sub;

    previous_values = row_to_json(OLD)::jsonb;
    new_values = row_to_json(NEW)::jsonb;

    INSERT INTO leads_tracking_history (
        tracking_id,
        user_id,
        changed_fields,
        previous_values,
        new_values
    ) VALUES (
        NEW.id,
        auth.uid(),
        changed_fields,
        previous_values,
        new_values
    );

    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create trigger for logging changes
CREATE TRIGGER log_leads_tracking_changes
    AFTER UPDATE ON leads_tracking
    FOR EACH ROW
    EXECUTE FUNCTION log_leads_tracking_changes();