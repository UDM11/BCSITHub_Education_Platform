-- Upgrade script for public.users table in Supabase
-- Run this in your Supabase Dashboard SQL Editor

-- 1. Drop the cascading foreign key constraint referencing auth.users if it exists
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. Add columns to store OAuth metadata, active/verified state, and timestamps
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS college_address TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'email';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS provider_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false NOT NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- 3. Add OTP columns for email verification
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS otp_code TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP WITH TIME ZONE;

-- 4. Add session column to past_papers table
ALTER TABLE public.past_papers ADD COLUMN IF NOT EXISTS session TEXT;
