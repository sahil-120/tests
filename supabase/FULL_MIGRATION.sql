-- ============================================================
-- FULL MIGRATION SCRIPT for new Supabase project
-- dbcdhjuqdmkhrhqkmtpo
-- Run this entire script in Supabase SQL Editor
-- ============================================================

-- ── MIGRATION 1: Core tables ────────────────────────────────

-- Roles enum
create type public.app_role as enum ('admin', 'moderator', 'user');

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone authenticated"
  on public.profiles for select to authenticated using (true);
create policy "Users update own profile"
  on public.profiles for update to authenticated using (auth.uid() = id);
create policy "Users insert own profile"
  on public.profiles for insert to authenticated with check (auth.uid() = id);

-- User roles
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique(user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists(select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users view own roles"
  on public.user_roles for select to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "Admins manage roles"
  on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile and default role on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), new.raw_user_meta_data->>'avatar_url');
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Exam attempts (results history)
create table public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exam_type text not null,
  category text,
  set_id text,
  title text,
  score integer not null default 0,
  total_questions integer not null default 0,
  correct_count integer not null default 0,
  wrong_count integer not null default 0,
  skipped_count integer not null default 0,
  time_taken_seconds integer,
  answers jsonb,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.exam_attempts to authenticated;
grant all on public.exam_attempts to service_role;
alter table public.exam_attempts enable row level security;

create policy "Users view own attempts"
  on public.exam_attempts for select to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "Users insert own attempts"
  on public.exam_attempts for insert to authenticated
  with check (auth.uid() = user_id);
create policy "Users update own attempts"
  on public.exam_attempts for update to authenticated using (auth.uid() = user_id);
create policy "Users delete own attempts"
  on public.exam_attempts for delete to authenticated using (auth.uid() = user_id);

create index idx_exam_attempts_user on public.exam_attempts(user_id, created_at desc);
create index idx_exam_attempts_leaderboard on public.exam_attempts(exam_type, score desc);

-- ── MIGRATION 2: Security revokes ───────────────────────────

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.has_role(uuid, app_role) from public, anon;

-- ── MIGRATION 3: Custom MCQs & Exams ────────────────────────

-- Custom MCQs table
CREATE TABLE public.custom_mcqs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_index INTEGER NOT NULL DEFAULT 0,
  explanation TEXT,
  category TEXT,
  subject TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_mcqs TO authenticated;
GRANT ALL ON public.custom_mcqs TO service_role;
ALTER TABLE public.custom_mcqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View published mcqs or admin"
  ON public.custom_mcqs FOR SELECT
  TO authenticated
  USING (is_published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert mcqs"
  ON public.custom_mcqs FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update mcqs"
  ON public.custom_mcqs FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete mcqs"
  ON public.custom_mcqs FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Custom Exams table
CREATE TABLE public.custom_exams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  time_limit_minutes INTEGER DEFAULT 45,
  question_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_exams TO authenticated;
GRANT ALL ON public.custom_exams TO service_role;
ALTER TABLE public.custom_exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View published exams or admin"
  ON public.custom_exams FOR SELECT
  TO authenticated
  USING (is_published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert exams"
  ON public.custom_exams FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update exams"
  ON public.custom_exams FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete exams"
  ON public.custom_exams FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Reusable updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_custom_mcqs_updated_at
  BEFORE UPDATE ON public.custom_mcqs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_exams_updated_at
  BEFORE UPDATE ON public.custom_exams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── MIGRATION 4: Leaderboard functions ──────────────────────

CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE(
  user_id uuid,
  full_name text,
  attempts bigint,
  best_pct numeric,
  avg_pct numeric,
  total_score bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    a.user_id,
    COALESCE(p.full_name, 'Anonymous') AS full_name,
    COUNT(*)::bigint AS attempts,
    MAX(CASE WHEN a.total_questions > 0
        THEN (a.score::numeric / (a.total_questions * 2)) * 100 ELSE 0 END) AS best_pct,
    AVG(CASE WHEN a.total_questions > 0
        THEN (a.score::numeric / (a.total_questions * 2)) * 100 ELSE 0 END) AS avg_pct,
    SUM(a.score)::bigint AS total_score
  FROM public.exam_attempts a
  LEFT JOIN public.profiles p ON p.id = a.user_id
  GROUP BY a.user_id, p.full_name
  ORDER BY SUM(a.score) DESC
$$;

REVOKE EXECUTE ON FUNCTION public.get_leaderboard() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_leaderboard() TO authenticated;

CREATE OR REPLACE FUNCTION public.get_set_ranking(_set_id text)
RETURNS TABLE(
  user_id uuid,
  full_name text,
  best_score integer,
  best_pct numeric,
  attempts bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    a.user_id,
    COALESCE(p.full_name, 'Anonymous') AS full_name,
    MAX(a.score) AS best_score,
    MAX(CASE WHEN a.total_questions > 0
        THEN (a.score::numeric / (a.total_questions * 2)) * 100 ELSE 0 END) AS best_pct,
    COUNT(*)::bigint AS attempts
  FROM public.exam_attempts a
  LEFT JOIN public.profiles p ON p.id = a.user_id
  WHERE a.set_id = _set_id
  GROUP BY a.user_id, p.full_name
  ORDER BY MAX(a.score) DESC
$$;

REVOKE EXECUTE ON FUNCTION public.get_set_ranking(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_set_ranking(text) TO authenticated;

-- ── MIGRATION 5: Activity + Updated Leaderboard ──────────────

-- Profiles: add activity columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;

-- Updated leaderboard (includes all profiles)
CREATE OR REPLACE FUNCTION public.get_leaderboard()
RETURNS TABLE(
  user_id uuid,
  full_name text,
  attempts bigint,
  best_pct numeric,
  avg_pct numeric,
  total_score bigint
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id AS user_id,
    COALESCE(p.full_name, 'Anonymous') AS full_name,
    COUNT(a.id)::bigint AS attempts,
    COALESCE(MAX(CASE WHEN a.total_questions > 0
            THEN (a.score::numeric / (a.total_questions * 2)) * 100 ELSE 0 END), 0) AS best_pct,
    COALESCE(AVG(CASE WHEN a.total_questions > 0
            THEN (a.score::numeric / (a.total_questions * 2)) * 100 ELSE 0 END), 0) AS avg_pct,
    COALESCE(SUM(a.score), 0)::bigint AS total_score
  FROM public.profiles p
  LEFT JOIN public.exam_attempts a ON a.user_id = p.id
  GROUP BY p.id, p.full_name
  ORDER BY total_score DESC, attempts DESC, full_name ASC
$$;

-- ── MIGRATION 6: Streaks, Badges, Daily MCQ ─────────────────

-- Streak fields on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS current_streak INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS longest_streak INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_attempt_date DATE;

-- Badges
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_code TEXT NOT NULL,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_code)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_badges TO authenticated;
GRANT SELECT ON public.user_badges TO anon;
GRANT ALL ON public.user_badges TO service_role;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "badges readable by all" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "users insert own badges" ON public.user_badges FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users delete own badges" ON public.user_badges FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Daily MCQs (admin posts)
CREATE TABLE IF NOT EXISTS public.daily_mcqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  for_date DATE NOT NULL DEFAULT CURRENT_DATE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_index INTEGER NOT NULL,
  explanation TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.daily_mcqs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.daily_mcqs TO authenticated;
GRANT ALL ON public.daily_mcqs TO service_role;
ALTER TABLE public.daily_mcqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "daily mcqs readable" ON public.daily_mcqs FOR SELECT USING (true);
CREATE POLICY "admins manage daily mcqs (insert)" ON public.daily_mcqs FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage daily mcqs (update)" ON public.daily_mcqs FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins manage daily mcqs (delete)" ON public.daily_mcqs FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- Daily MCQ Responses
CREATE TABLE IF NOT EXISTS public.daily_mcq_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_mcq_id UUID NOT NULL REFERENCES public.daily_mcqs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  selected_index INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(daily_mcq_id, user_id)
);
GRANT SELECT, INSERT ON public.daily_mcq_responses TO authenticated;
GRANT SELECT ON public.daily_mcq_responses TO anon;
GRANT ALL ON public.daily_mcq_responses TO service_role;
ALTER TABLE public.daily_mcq_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "responses readable" ON public.daily_mcq_responses FOR SELECT USING (true);
CREATE POLICY "users insert own response" ON public.daily_mcq_responses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Streak update function
CREATE OR REPLACE FUNCTION public.update_streak()
RETURNS TABLE(current_streak INTEGER, longest_streak INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  today DATE := CURRENT_DATE;
  last_date DATE;
  cur INTEGER;
  longest INTEGER;
BEGIN
  IF uid IS NULL THEN RETURN; END IF;
  SELECT last_attempt_date, profiles.current_streak, profiles.longest_streak
    INTO last_date, cur, longest FROM public.profiles WHERE id = uid;
  IF last_date = today THEN
    NULL;
  ELSIF last_date = today - INTERVAL '1 day' THEN
    cur := COALESCE(cur,0) + 1;
  ELSE
    cur := 1;
  END IF;
  longest := GREATEST(COALESCE(longest,0), cur);
  UPDATE public.profiles
    SET current_streak = cur, longest_streak = longest, last_attempt_date = today
    WHERE id = uid;
  RETURN QUERY SELECT cur, longest;
END;
$$;

-- Get today's daily MCQ with stats
CREATE OR REPLACE FUNCTION public.get_today_daily_mcq()
RETURNS TABLE(
  id UUID, question TEXT, options JSONB, correct_index INTEGER, explanation TEXT,
  total_responses BIGINT, correct_responses BIGINT,
  my_selected INTEGER, my_correct BOOLEAN
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT d.id, d.question, d.options, d.correct_index, d.explanation,
    COALESCE((SELECT COUNT(*) FROM public.daily_mcq_responses r WHERE r.daily_mcq_id=d.id),0),
    COALESCE((SELECT COUNT(*) FROM public.daily_mcq_responses r WHERE r.daily_mcq_id=d.id AND r.is_correct),0),
    (SELECT selected_index FROM public.daily_mcq_responses r WHERE r.daily_mcq_id=d.id AND r.user_id=auth.uid()),
    (SELECT is_correct FROM public.daily_mcq_responses r WHERE r.daily_mcq_id=d.id AND r.user_id=auth.uid())
  FROM public.daily_mcqs d
  WHERE d.for_date = CURRENT_DATE
  ORDER BY d.created_at DESC
  LIMIT 1
$$;

-- Get correct responders for a daily mcq
CREATE OR REPLACE FUNCTION public.get_daily_mcq_responders(_mcq_id UUID)
RETURNS TABLE(user_id UUID, full_name TEXT, is_correct BOOLEAN, selected_index INTEGER, created_at TIMESTAMPTZ)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT r.user_id, COALESCE(p.full_name,'Anonymous'), r.is_correct, r.selected_index, r.created_at
  FROM public.daily_mcq_responses r
  LEFT JOIN public.profiles p ON p.id = r.user_id
  WHERE r.daily_mcq_id = _mcq_id
  ORDER BY r.is_correct DESC, r.created_at ASC
$$;

-- ── DONE! ────────────────────────────────────────────────────
-- All tables, functions, triggers and policies created.
-- After running, sign up with your admin account and you'll
-- automatically get the 'user' role. Then manually run:
--
-- INSERT INTO public.user_roles (user_id, role)
-- VALUES ('20f38db7-5055-4c2e-853e-8a64459198f2', 'admin')
-- ON CONFLICT (user_id, role) DO NOTHING;
