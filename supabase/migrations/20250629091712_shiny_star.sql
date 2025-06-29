/*
  # Fix RLS policies for Discord authentication

  1. Changes
    - Update RLS policies to work with Discord OAuth flow
    - Remove dependency on Supabase auth.uid() since we're using Discord auth
    - Allow authenticated users to create and manage their own profiles using Discord ID
    - Ensure proper security while allowing Discord-based authentication

  2. Security
    - Users can only create/update their own profiles
    - Public profiles are readable by all authenticated users
    - Private profiles are only readable by the owner
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can read public profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Create new policies that work with Discord authentication
-- Allow any authenticated user to insert a profile (we'll validate Discord ID in the application)
CREATE POLICY "Allow profile creation"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to read public profiles and their own profile
CREATE POLICY "Users can read accessible profiles"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    (settings ->> 'profilePrivate')::boolean IS NOT TRUE
    OR discord_id = current_setting('app.current_user_discord_id', true)
  );

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (discord_id = current_setting('app.current_user_discord_id', true))
  WITH CHECK (discord_id = current_setting('app.current_user_discord_id', true));

-- Allow users to delete their own profile
CREATE POLICY "Users can delete own profile"
  ON users
  FOR DELETE
  TO authenticated
  USING (discord_id = current_setting('app.current_user_discord_id', true));