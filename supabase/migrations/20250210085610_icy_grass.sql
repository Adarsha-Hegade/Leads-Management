/*
  # Add user_id to leads table

  1. Changes
    - Add user_id column to leads table
    - Add foreign key constraint to auth.users
    - Update RLS policies
*/

-- Add user_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'leads' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE leads ADD COLUMN user_id uuid REFERENCES auth.users(id);
  END IF;
END $$;