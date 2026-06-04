-- BeaconHaus Companion: Supabase schema
-- Run in the Supabase SQL editor. Sets up tables, ownership, and Row Level Security.
-- Every row is owned by the signed-in user via user_id, and RLS limits access to that user.

-- Helper: keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

-- ---------------------------------------------------------------------------
-- profile: one row per user, holds her gentle settings
-- ---------------------------------------------------------------------------
create table if not exists public.profile (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text default 'Liz',
  tagline text default 'Illuminating Life, Legacy, and Love',
  weekly_warmup_goal int default 4,
  warm_threshold_days int default 14,
  cooling_threshold_days int default 30,
  morning_warmup_count int default 3,
  week_start date,
  week_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- people: the warm network
-- ---------------------------------------------------------------------------
create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  role_org text,
  sphere text,
  relationship text,
  doors_can_open text,
  the_ask text,
  email text,
  phone text,
  linkedin_url text,
  status text default 'To reach out',
  last_touched date,
  next_step text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists people_user_idx on public.people (user_id);

-- ---------------------------------------------------------------------------
-- facilities: the target places
-- ---------------------------------------------------------------------------
create table if not exists public.facilities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  facility_name text not null,
  type text,
  town text,
  region text,
  lead_route text,
  aligned text,
  decision_maker text,
  title text,
  email text,
  phone text,
  website text,
  status text default 'To research',
  next_step text,
  fit_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists facilities_user_idx on public.facilities (user_id);

-- ---------------------------------------------------------------------------
-- captures: pain points, case studies, ideas
-- ---------------------------------------------------------------------------
create table if not exists public.captures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  type text default 'Idea',
  title text not null,
  detail text,
  created_at timestamptz default now()
);
create index if not exists captures_user_idx on public.captures (user_id);

-- ---------------------------------------------------------------------------
-- oauth_tokens: server-side storage for Drive and LinkedIn tokens
-- Never expose these to the client. Read and refresh only in server code.
-- ---------------------------------------------------------------------------
create table if not exists public.oauth_tokens (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  provider text not null,
  access_token text,
  refresh_token text,
  scope text,
  expires_at timestamptz,
  updated_at timestamptz default now(),
  primary key (user_id, provider)
);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
drop trigger if exists t_profile_updated on public.profile;
create trigger t_profile_updated before update on public.profile
  for each row execute function public.set_updated_at();
drop trigger if exists t_people_updated on public.people;
create trigger t_people_updated before update on public.people
  for each row execute function public.set_updated_at();
drop trigger if exists t_facilities_updated on public.facilities;
create trigger t_facilities_updated before update on public.facilities
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security: each user sees only their own rows
-- ---------------------------------------------------------------------------
alter table public.profile enable row level security;
alter table public.people enable row level security;
alter table public.facilities enable row level security;
alter table public.captures enable row level security;
alter table public.oauth_tokens enable row level security;

-- profile
drop policy if exists profile_rw on public.profile;
create policy profile_rw on public.profile
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- people
drop policy if exists people_rw on public.people;
create policy people_rw on public.people
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- facilities
drop policy if exists facilities_rw on public.facilities;
create policy facilities_rw on public.facilities
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- captures
drop policy if exists captures_rw on public.captures;
create policy captures_rw on public.captures
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- oauth_tokens (server uses the service role, which bypasses RLS;
-- this policy keeps any client-side read locked to the owner just in case)
drop policy if exists oauth_self on public.oauth_tokens;
create policy oauth_self on public.oauth_tokens
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Optional seed for the first user. Replace the uuid with Liz's auth user id
-- after she signs in once, or seed from the app on first run instead.
-- ---------------------------------------------------------------------------
-- insert into public.profile (user_id) values ('REPLACE_WITH_LIZ_USER_ID')
--   on conflict (user_id) do nothing;
