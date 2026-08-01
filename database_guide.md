# BCSITHub - Database Configuration & Schema Guide

This project uses **Supabase** (PostgreSQL) as its primary relational database. This guide details the table designs, Row-Level Security (RLS) policies, and triggers used to power the platform.

---

## 📊 Database Schema Relationships

```
┌────────────────┐          ┌────────────────┐
│    profiles    │          │  past_papers   │
├────────────────┤          ├────────────────┤
│ id (PK, uuid)  │◀─────────│ id (PK, uuid)  │
│ email (text)   │          │ title (text)   │
│ name (text)    │          │ subject (text) │
│ role (text)    │          │ semester (int) │
│ semester (int) │          │ exam_type (txt)│
│ college (text) │          │ college (text) │
│ avatar_url(txt)│          │ file_url (text)│
│ created_at     │          │ uploaded_by(FK)│
└────────────────┘          │ approved (bool)│
                            │ downloads (int)│
                            │ created_at     │
                            └────────────────┘
```

---

## 🗄️ Database Tables Definition

### 1. `public.profiles`
Stores student, teacher, and administrator profile metadata linked to Supabase Auth (`auth.users`).

- **Policies (Row-Level Security)**:
  - **Read**: Anyone can read profiles.
  - **Insert**: Allowed on signup.
  - **Update**: Users can only update their own profile (`auth.uid() = id`).

### 2. `public.past_papers`
Holds information about past exams, midterms, quizzes, and solved papers uploaded by users.

- **Policies (Row-Level Security)**:
  - **Read**: Anyone can read approved papers. Users can also view their own unapproved papers.
  - **Insert**: Restricted to logged-in/authenticated users.
  - **Update/Delete**: Allowed for the uploader or administrators.

### 3. `public.pu_notices`
Stores university announcements, admission details, and exam updates.

- **Policies (Row-Level Security)**:
  - **Read**: Publicly readable by anyone.
  - **Write/Update/Delete**: Restricted to admin profiles.

---

## ⚡ Sync Triggers (Automated Profile Creation)

To ensure that profiles are automatically created when a user signs up via Supabase Auth, a PL/pgSQL function and trigger are registered on the `auth.users` table:

```sql
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
```
