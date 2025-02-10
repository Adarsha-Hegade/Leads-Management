/*
  # Add Authentication and Fix Lead Management

  1. Security Updates
    - Add RLS policies for authenticated access
    - Update existing policies to require authentication
    
  2. Changes
    - Add user_id column to link leads with authenticated users
    - Add policies for CRUD operations
*/

-- Add user_id column to leads table
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access" ON leads;

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can create leads"
ON leads FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own leads"
ON leads FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own leads"
ON leads FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leads"
ON leads FOR DELETE
TO authenticated
USING (auth.uid() = user_id);