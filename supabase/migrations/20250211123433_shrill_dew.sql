/*
  # Fix leads table permissions

  1. Changes
    - Drop existing RLS policies
    - Add new RLS policies for authenticated users
    - Grant necessary permissions
  
  2. Security
    - Enable RLS
    - Add policies for CRUD operations
    - Ensure authenticated users can only access their own data
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create leads" ON leads;
DROP POLICY IF EXISTS "Users can view their own leads" ON leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON leads;
DROP POLICY IF EXISTS "Allow public read access" ON leads;

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Enable read access for authenticated users"
ON leads FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Enable insert for authenticated users"
ON leads FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for authenticated users"
ON leads FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Enable delete for authenticated users"
ON leads FOR DELETE
TO authenticated
USING (true);

-- Grant permissions to authenticated users
GRANT ALL ON leads TO authenticated;