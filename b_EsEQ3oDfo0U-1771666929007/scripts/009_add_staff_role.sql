-- Migration: Add 'staff' role to admin_role enum and update schema
-- Run this in your Supabase SQL Editor

-- Add 'staff' to the existing admin_role enum
ALTER TYPE admin_role ADD VALUE IF NOT EXISTS 'staff';

-- Update any existing 'volunteer' roles to 'staff'
UPDATE public.admin_profiles
  SET role = 'staff'
  WHERE role = 'volunteer';

-- Update the default role for new users to 'staff' instead of 'admin'
ALTER TABLE public.admin_profiles ALTER COLUMN role SET DEFAULT 'staff';

-- Update the trigger function so new signups get 'staff' by default
CREATE OR REPLACE FUNCTION public.handle_new_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_profiles (id, full_name, role)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    coalesce((new.raw_user_meta_data ->> 'role')::admin_role, 'staff')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

-- Set your current user (info@devanhaar.com) as admin
-- Replace the UUID below with your actual user ID if different
UPDATE public.admin_profiles
  SET role = 'admin'
  WHERE id = 'e801587c-e28a-43a0-a142-41daf2bb65df';
