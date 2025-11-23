-- Seed Data SQL Script
-- Run this in your Supabase SQL Editor to populate the database with sample data
-- 
-- Instructions:
-- 1. Go to your Supabase Dashboard: https://supabase.com/dashboard
-- 2. Select your project
-- 3. Go to SQL Editor (left sidebar)
-- 4. Click "New query"
-- 5. Paste this entire script
-- 6. Click "Run" or press Ctrl+Enter
-- 7. Wait for success message

-- Note: This script creates auth users and profiles, then creates groups
-- You may need to temporarily disable RLS or run as a service role

-- Step 1: Create a function to seed profiles (bypassing RLS temporarily)
DO $$
DECLARE
  user_id_1 UUID;
  user_id_2 UUID;
  user_id_3 UUID;
  user_id_4 UUID;
  user_id_5 UUID;
  user_id_6 UUID;
  user_id_7 UUID;
  user_id_8 UUID;
  user_id_9 UUID;
  user_id_10 UUID;
  group_id_1 UUID;
  group_id_2 UUID;
  group_id_3 UUID;
  group_id_4 UUID;
  group_id_5 UUID;
BEGIN
  -- Create auth users and get their IDs
  -- Note: We'll use the auth.users table directly with a service role
  
  -- For demo purposes, we'll create profiles that reference existing users
  -- OR create new auth users if you have the right permissions
  
  -- Alternative: Insert profiles directly (if you have a way to get user IDs)
  -- For now, let's create the groups first since they're easier
  
  RAISE NOTICE 'Starting seed process...';
  
  -- Get the first existing user to use as creator (or create a dummy one)
  -- We'll use a workaround: create groups with the first available user
  
END $$;

-- Actually, let's use a simpler approach: Create groups directly
-- Groups can be created by any authenticated user, so we'll use a service role approach
-- OR we can create a migration that inserts data

-- Temporary: Disable RLS for seeding (re-enable after)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_memberships DISABLE ROW LEVEL SECURITY;

-- Insert sample profiles (you'll need to replace the UUIDs with actual auth user IDs)
-- For now, let's create a helper function

-- Better approach: Create a stored procedure that can be called
CREATE OR REPLACE FUNCTION seed_sample_data()
RETURNS TABLE(
  users_created INTEGER,
  groups_created INTEGER,
  memberships_created INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_group_id UUID;
  v_users_count INTEGER := 0;
  v_groups_count INTEGER := 0;
  v_memberships_count INTEGER := 0;
  v_creator_id UUID;
BEGIN
  -- Get the first user as creator (or use a specific one)
  SELECT id INTO v_creator_id FROM auth.users LIMIT 1;
  
  IF v_creator_id IS NULL THEN
    RAISE EXCEPTION 'No users found. Please create at least one user account first.';
  END IF;

  -- Create groups first (easier, no auth required)
  INSERT INTO public.groups (name, description, tags, created_by) VALUES
    ('Hackathon Enthusiasts', 'A group for students interested in hackathons, coding competitions, and collaborative projects. Share ideas, find teammates, and build amazing things together!', ARRAY['Hackathon', 'Project', 'AI', 'Web Development'], v_creator_id)
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_group_id;
  IF v_group_id IS NOT NULL THEN v_groups_count := v_groups_count + 1; END IF;

  INSERT INTO public.groups (name, description, tags, created_by) VALUES
    ('Study Group Central', 'Connect with study partners across all majors. Find people to study with, share notes, and ace your classes together.', ARRAY['Study', 'Academic'], v_creator_id)
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_group_id;
  IF v_group_id IS NOT NULL THEN v_groups_count := v_groups_count + 1; END IF;

  INSERT INTO public.groups (name, description, tags, created_by) VALUES
    ('Gaming Squad', 'For all the gamers out there! Find teammates for Valorant, League of Legends, and other games. Casual and competitive players welcome.', ARRAY['Gaming', 'Valorant', 'League of Legends', 'Elden Ring'], v_creator_id)
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_group_id;
  IF v_group_id IS NOT NULL THEN v_groups_count := v_groups_count + 1; END IF;

  INSERT INTO public.groups (name, description, tags, created_by) VALUES
    ('Sports Fans United', 'Watch parties, game discussions, and sports talk. Whether you''re into soccer, basketball, or F1, this is your group!', ARRAY['Soccer', 'NBA', 'NFL', 'F1', 'Champions League'], v_creator_id)
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_group_id;
  IF v_group_id IS NOT NULL THEN v_groups_count := v_groups_count + 1; END IF;

  INSERT INTO public.groups (name, description, tags, created_by) VALUES
    ('Music Lovers', 'Share your favorite music, discover new artists, and connect with fellow music enthusiasts. All genres welcome!', ARRAY['Metal', 'Hip-Hop', 'Jazz', 'Classical'], v_creator_id)
    ON CONFLICT DO NOTHING
    RETURNING id INTO v_group_id;
  IF v_group_id IS NOT NULL THEN v_groups_count := v_groups_count + 1; END IF;

  -- Note: Creating auth users requires admin API access
  -- For profiles, you'll need to either:
  -- 1. Use the Supabase Dashboard to create users manually
  -- 2. Use the Edge Function (which needs to be deployed)
  -- 3. Use the command line script with service role key

  RETURN QUERY SELECT v_users_count, v_groups_count, v_memberships_count;
END;
$$;

-- Run the seed function
SELECT * FROM seed_sample_data();

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_memberships ENABLE ROW LEVEL SECURITY;

-- Clean up the function (optional)
-- DROP FUNCTION IF EXISTS seed_sample_data();

