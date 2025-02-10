/*
  # Fix leads table access

  1. Security Changes
    - Enable RLS on leads table if not already enabled
    - Add policy to allow public read access to all leads
    - Grant SELECT permission to anon role
*/

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access"
ON leads
FOR SELECT
TO public
USING (true);

-- Grant SELECT permission to anon role
GRANT SELECT ON leads TO anon;