-- Enable Row Level Security (RLS)
alter table if exists public.users enable row level security;
alter table if exists public.quizzes enable row level security;
alter table if exists public.games enable row level security;
alter table if exists public.game_sessions enable row level security;

-- Create tables
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  username text unique not null,
  role text check (role in ('teacher', 'student', 'admin')) not null default 'student',
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.quizzes (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  cover_image text,
  creator_id uuid references public.users(id) on delete cascade not null,
  questions jsonb not null default '[]'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  is_published boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.games (
  id uuid default gen_random_uuid() primary key,
  pin text unique not null,
  quiz_id uuid references public.quizzes(id) on delete cascade not null,
  host_id uuid references public.users(id) on delete cascade not null,
  status text check (status in ('waiting', 'active', 'finished')) default 'waiting',
  current_question_index integer default 0,
  players jsonb default '[]'::jsonb,
  started_at timestamp with time zone,
  finished_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.game_sessions (
  id uuid default gen_random_uuid() primary key,
  game_id uuid references public.games(id) on delete cascade not null,
  player_id uuid not null,
  nickname text not null,
  score integer default 0,
  answers jsonb default '[]'::jsonb,
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_active boolean default true
);

-- Create indexes for better performance
create index if not exists users_email_idx on public.users(email);
create index if not exists users_username_idx on public.users(username);
create index if not exists quizzes_creator_id_idx on public.quizzes(creator_id);
create index if not exists games_pin_idx on public.games(pin);
create index if not exists games_host_id_idx on public.games(host_id);
create index if not exists game_sessions_game_id_idx on public.game_sessions(game_id);

-- Set up Row Level Security (RLS) policies
-- Users can read their own data
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

-- Quiz policies
create policy "Anyone can view published quizzes" on public.quizzes
  for select using (is_published = true);

create policy "Users can view own quizzes" on public.quizzes
  for select using (auth.uid() = creator_id);

create policy "Users can create quizzes" on public.quizzes
  for insert with check (auth.uid() = creator_id);

create policy "Users can update own quizzes" on public.quizzes
  for update using (auth.uid() = creator_id);

create policy "Users can delete own quizzes" on public.quizzes
  for delete using (auth.uid() = creator_id);

-- Game policies
create policy "Anyone can view active games" on public.games
  for select using (status in ('waiting', 'active'));

create policy "Hosts can manage their games" on public.games
  for all using (auth.uid() = host_id);

-- Game session policies
create policy "Players can view sessions for their games" on public.game_sessions
  for select using (true);

create policy "Players can insert their own sessions" on public.game_sessions
  for insert with check (true);

create policy "Players can update their own sessions" on public.game_sessions
  for update using (player_id::text = auth.uid()::text);

-- Create functions for updated_at timestamps
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger handle_users_updated_at
  before update on public.users
  for each row execute function public.handle_updated_at();

create trigger handle_quizzes_updated_at
  before update on public.quizzes
  for each row execute function public.handle_updated_at();

create trigger handle_games_updated_at
  before update on public.games
  for each row execute function public.handle_updated_at();

-- Create a function to generate unique game PINs
create or replace function public.generate_game_pin()
returns text as $$
declare
  new_pin text;
  pin_exists boolean;
begin
  loop
    -- Generate a 6-digit PIN
    new_pin := lpad((random() * 999999)::int::text, 6, '0');
    
    -- Check if PIN already exists
    select exists(select 1 from public.games where pin = new_pin and status != 'finished') into pin_exists;
    
    -- If PIN doesn't exist, return it
    if not pin_exists then
      return new_pin;
    end if;
  end loop;
end;
$$ language plpgsql;