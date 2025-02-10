/*
  # Add Lead Management Columns

  1. New Columns
    - `status`: Lead status (New, Follow-up, Interested, Converted, Not Interested)
    - `last_contact`: Timestamp of last contact with the lead
    - `notes`: Array of notes for tracking discussions and follow-ups
    - `sales_value`: Numeric field for tracking potential/actual sale value
    - `conversion_date`: Timestamp when lead was converted to sale
    
  2. Changes
    - Add default value for status column
    - Add check constraint for valid status values
    
  3. Security
    - Maintain existing RLS policies
*/

-- Add new columns with safe operations
DO $$ 
BEGIN
  -- Add status column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'status'
  ) THEN
    ALTER TABLE leads ADD COLUMN status text DEFAULT 'New' CHECK (
      status IN ('New', 'Follow-up', 'Interested', 'Converted', 'Not Interested')
    );
  END IF;

  -- Add last_contact column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'last_contact'
  ) THEN
    ALTER TABLE leads ADD COLUMN last_contact timestamptz;
  END IF;

  -- Add notes column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'notes'
  ) THEN
    ALTER TABLE leads ADD COLUMN notes text[] DEFAULT '{}';
  END IF;

  -- Add sales_value column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'sales_value'
  ) THEN
    ALTER TABLE leads ADD COLUMN sales_value numeric(10,2);
  END IF;

  -- Add conversion_date column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'conversion_date'
  ) THEN
    ALTER TABLE leads ADD COLUMN conversion_date timestamptz;
  END IF;
END $$;