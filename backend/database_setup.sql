-- ==========================================
-- BCSITHub Database Schema Setup
-- Copy and paste this script directly into your 
-- Supabase SQL Editor and click RUN to create the tables.
-- ==========================================

-- 1. Create Support Tickets Table
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'medium',
    resolved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS (Row Level Security) if desired, or disable for public submission:
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Allow anonymous and authenticated users to submit tickets
CREATE POLICY "Allow public ticket submissions" 
ON public.support_tickets FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Allow only administrators to view, update, and delete support tickets
CREATE POLICY "Allow admin operations" 
ON public.support_tickets FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE public.users.id = auth.uid() AND public.users.role = 'admin'
    )
);


-- 2. Create Pomodoro Focus Sessions Table
CREATE TABLE IF NOT EXISTS public.pomodoro_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    duration INTEGER NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;

-- Allow users to manage only their own focus sessions
CREATE POLICY "Users can manage own focus sessions" 
ON public.pomodoro_sessions FOR ALL 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. Create Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    otp_code TEXT,
    otp_expires_at TIMESTAMPTZ,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Allow anonymous and authenticated insertions (subscribing requests)
CREATE POLICY "Allow public newsletter signups" 
ON public.newsletter_subscribers FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Allow anonymous and authenticated updates (for OTP verification check updates)
CREATE POLICY "Allow public newsletter updates" 
ON public.newsletter_subscribers FOR UPDATE 
TO anon, authenticated 
USING (true)
WITH CHECK (true);

-- Allow only administrators to select or delete subscribers
CREATE POLICY "Allow admin subscriber operations" 
ON public.newsletter_subscribers FOR ALL 
TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE public.users.id = auth.uid() AND public.users.role = 'admin'
    )
);
