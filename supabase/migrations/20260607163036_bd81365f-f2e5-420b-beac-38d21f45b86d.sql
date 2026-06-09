
-- 1. Profiles: add activity columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_active TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;

-- 2. Leaderboard now includes ALL profiles (LEFT JOIN), so newly signed-up
--    users appear with 0 attempts/score instead of being invisible.
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

-- 3. Seed the first admin (Amrita Gupta — the most active tester).
--    Idempotent thanks to the unique (user_id, role) constraint.
INSERT INTO public.user_roles (user_id, role)
VALUES ('053345d7-3936-4400-9b62-06120c61a607', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
