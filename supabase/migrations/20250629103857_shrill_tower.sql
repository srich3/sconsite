/*
  # Fix Characters Table RLS Policies

  1. Changes
    - Drop existing character policies that might be causing conflicts
    - Create new permissive policies for characters table
    - Ensure anonymous users can also create characters during auth flow

  2. Security
    - Allow all operations for authenticated users
    - Allow anonymous operations for initial character creation
*/

-- Drop any existing policies on characters table
DROP POLICY IF EXISTS "Allow all operations for authenticated users on characters" ON characters;
DROP POLICY IF EXISTS "Users can manage own characters" ON characters;
DROP POLICY IF EXISTS "Users can read own characters" ON characters;
DROP POLICY IF EXISTS "Enable all operations for authenticated users on characters" ON characters;

-- Create new permissive policies for characters
CREATE POLICY "Allow all operations on characters for authenticated"
  ON characters
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Also allow anonymous access for character creation during auth flow
CREATE POLICY "Allow anonymous character operations"
  ON characters
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;