/*
  # Add Comprehensive Lead Management Fields

  1. New Columns
    - `status`: Lead status with new options
    - `lead_source`: Source of the lead
    - `initial_contact_date`: Date of first contact
    - `next_followup_date`: Scheduled follow-up date
    - `interest_level`: High/Medium/Low
    - `activity_checklist`: JSONB array for tracking activities
    - `requirements`: Text array for customer requirements
    - `objections`: Text array for concerns/objections
    - `next_steps`: Text for planned actions
    - `interactions`: JSONB array for follow-up history
    
  2. Changes
    - Update status enum with new values
    - Add default values for new columns
    
  3. Security
    - Maintain existing RLS policies
*/

DO $$ 
BEGIN
  -- Update status options
  ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'status'
  ) THEN
    ALTER TABLE leads ADD COLUMN status text DEFAULT 'New' CHECK (
      status IN ('New', 'In Progress', 'Pending Follow-up', 'Qualified', 'Lost')
    );
  ELSE
    ALTER TABLE leads ADD CONSTRAINT leads_status_check 
      CHECK (status IN ('New', 'In Progress', 'Pending Follow-up', 'Qualified', 'Lost'));
  END IF;

  -- Add lead source
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'lead_source'
  ) THEN
    ALTER TABLE leads ADD COLUMN lead_source text;
  END IF;

  -- Add initial contact date
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'initial_contact_date'
  ) THEN
    ALTER TABLE leads ADD COLUMN initial_contact_date timestamptz;
  END IF;

  -- Add next followup date
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'next_followup_date'
  ) THEN
    ALTER TABLE leads ADD COLUMN next_followup_date timestamptz;
  END IF;

  -- Add interest level
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'interest_level'
  ) THEN
    ALTER TABLE leads ADD COLUMN interest_level text CHECK (
      interest_level IN ('High', 'Medium', 'Low')
    );
  END IF;

  -- Add activity checklist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'activity_checklist'
  ) THEN
    ALTER TABLE leads ADD COLUMN activity_checklist jsonb DEFAULT '{
      "initial_call": false,
      "catalogue_sent": false,
      "demo_completed": false,
      "pricing_discussed": false,
      "proposal_sent": false
    }'::jsonb;
  END IF;

  -- Add requirements
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'requirements'
  ) THEN
    ALTER TABLE leads ADD COLUMN requirements text[] DEFAULT '{}';
  END IF;

  -- Add objections
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'objections'
  ) THEN
    ALTER TABLE leads ADD COLUMN objections text[] DEFAULT '{}';
  END IF;

  -- Add next steps
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'next_steps'
  ) THEN
    ALTER TABLE leads ADD COLUMN next_steps text;
  END IF;

  -- Add interactions history
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'interactions'
  ) THEN
    ALTER TABLE leads ADD COLUMN interactions jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;