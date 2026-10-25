-- DayTrack initial schema

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  timezone text default 'UTC',
  day_boundary_hour int default 0 check (day_boundary_hour >= 0 and day_boundary_hour <= 6),
  streak_freezes_remaining int default 2,
  week_starts_on text default 'monday' check (week_starts_on in ('monday', 'sunday')),
  confetti_enabled boolean default true,
  theme text default 'system' check (theme in ('system', 'light', 'dark', 'ocean', 'sunset')),
  created_at timestamptz default now()
);

create table if not exists public.trackables (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('habit', 'event')),
  title text not null,
  description text,
  category text default 'Other',
  group_name text default 'General',
  color text default '#6366f1',
  icon text default '✅',
  sort_order int default 0,
  schedule jsonb default '{"type":"daily"}'::jsonb,
  target_per_period int,
  starts_at timestamptz,
  ends_at timestamptz,
  reminder_time time,
  archived boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  trackable_id uuid not null references public.trackables(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  status text not null check (status in ('done', 'skipped', 'missed')),
  value numeric,
  notes text,
  created_at timestamptz default now(),
  unique (trackable_id, log_date)
);

create table if not exists public.mood_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  mood_score int not null check (mood_score >= 1 and mood_score <= 5),
  note text,
  created_at timestamptz default now(),
  unique (user_id, log_date)
);

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, log_date)
);

-- Indexes
create index if not exists idx_trackables_user on public.trackables(user_id);
create index if not exists idx_entries_user_date on public.entries(user_id, log_date);
create index if not exists idx_entries_trackable on public.entries(trackable_id);
create index if not exists idx_mood_logs_user_date on public.mood_logs(user_id, log_date);

-- RLS
alter table public.profiles enable row level security;
alter table public.trackables enable row level security;
alter table public.entries enable row level security;
alter table public.mood_logs enable row level security;
alter table public.journal_entries enable row level security;

create policy "Users manage own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users manage own trackables" on public.trackables
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own entries" on public.entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own mood logs" on public.mood_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own journal entries" on public.journal_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Reset streak freezes monthly
create or replace function public.reset_monthly_freezes()
returns void as $$
begin
  update public.profiles set streak_freezes_remaining = 2;
end;
$$ language plpgsql security definer;
