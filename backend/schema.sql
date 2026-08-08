-- 1. Profiles (linked with Supabase Auth auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  name text not null,
  role text default 'student' check (role in ('student', 'teacher', 'admin')),
  semester integer check (semester between 1 and 8),
  college text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Profiles
alter table public.profiles enable row level security;

create policy "Allow public read-access to profiles"
  on public.profiles for select
  using (true);

create policy "Allow users to update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Allow system/users to insert profile on signup"
  on public.profiles for insert
  with check (true);


-- 2. Past Papers table
create table if not exists public.past_papers (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  subject text not null,
  semester integer not null check (semester between 1 and 8),
  exam_type text not null check (exam_type in ('midterm', 'pre-board', 'final', 'quiz', 'assignment')),
  college text not null,
  session text,
  file_url text not null,
  uploaded_by uuid references public.profiles(id) on delete set null,
  approved boolean default false not null,
  downloads integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on Past Papers
alter table public.past_papers enable row level security;

create policy "Allow anyone to read approved past papers"
  on public.past_papers for select
  using (approved = true or (auth.uid() = uploaded_by));

create policy "Allow authenticated users to insert past papers"
  on public.past_papers for insert
  with check (auth.role() = 'authenticated');

create policy "Allow paper owner or admin to update/delete"
  on public.past_papers for all
  using (auth.uid() = uploaded_by or exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));


-- 3. Pokhara University Notices
create table if not exists public.pu_notices (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  file_url text not null,
  file_name text not null,
  file_size text not null,
  category text not null check (category in ('Exam', 'Admission', 'Result', 'General')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on PU Notices
alter table public.pu_notices enable row level security;

create policy "Allow anyone to read notices"
  on public.pu_notices for select
  using (true);

create policy "Allow admins to insert/update/delete notices"
  on public.pu_notices for all
  using (exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  ));


-- 4. Sync triggers: Automatic profile creation when auth.users is populated
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role, semester, college, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', 'Student'),
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    coalesce((new.raw_user_meta_data->>'semester')::integer, 1),
    new.raw_user_meta_data->>'college',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
