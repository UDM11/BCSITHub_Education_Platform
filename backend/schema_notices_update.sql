-- Migration script to support text-only notices in public.pu_notices
-- RUN THIS IN YOUR SUPABASE DASHBOARD SQL EDITOR (https://supabase.com)

-- 1. Add the "content" column for text notices if it does not exist
ALTER TABLE public.pu_notices ADD COLUMN IF NOT EXISTS content TEXT;

-- 2. Drop the NOT NULL constraints on file columns so they are optional
ALTER TABLE public.pu_notices ALTER COLUMN file_url DROP NOT NULL;
ALTER TABLE public.pu_notices ALTER COLUMN file_name DROP NOT NULL;
ALTER TABLE public.pu_notices ALTER COLUMN file_size DROP NOT NULL;
