-- =========================
-- Finished competitions are frozen
-- A competition is finished once its end date is before today
-- Cascades (account deletion) are never blocked
-- =========================

CREATE OR REPLACE FUNCTION public.enforce_competition_dates()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    today DATE := public.app_today();
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.start_date < today THEN
            RAISE EXCEPTION 'competition_start_in_past';
        END IF;

        RETURN NEW;
    END IF;

    IF OLD.end_date < today
        AND (NEW.start_date IS DISTINCT FROM OLD.start_date OR NEW.end_date IS DISTINCT FROM OLD.end_date) THEN
        RAISE EXCEPTION 'competition_finished';
    END IF;

    IF NEW.start_date IS DISTINCT FROM OLD.start_date THEN
        IF OLD.start_date <= today THEN
            RAISE EXCEPTION 'competition_already_started';
        END IF;

        IF NEW.start_date < today THEN
            RAISE EXCEPTION 'competition_start_in_past';
        END IF;
    END IF;

    IF NEW.end_date IS DISTINCT FROM OLD.end_date AND NEW.end_date <= today THEN
        RAISE EXCEPTION 'competition_end_in_past';
    END IF;

    RETURN NEW;
END;
$$;

CREATE FUNCTION public.prevent_finished_competition_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    IF pg_trigger_depth() > 1 THEN
        RETURN OLD;
    END IF;

    IF OLD.end_date < public.app_today() THEN
        RAISE EXCEPTION 'competition_finished';
    END IF;

    RETURN OLD;
END;
$$;

CREATE TRIGGER competitions_prevent_finished_delete
    BEFORE DELETE ON public.competitions
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_finished_competition_delete();

CREATE FUNCTION public.enforce_participants_freeze()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
    v_competition_id UUID;
BEGIN
    IF TG_OP = 'DELETE' THEN
        IF pg_trigger_depth() > 1 THEN
            RETURN OLD;
        END IF;

        v_competition_id := OLD.competition_id;
    ELSE
        v_competition_id := NEW.competition_id;
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public.competitions
        WHERE id = v_competition_id
        AND end_date < public.app_today()
    ) THEN
        RAISE EXCEPTION 'competition_finished';
    END IF;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER competition_participants_enforce_freeze
    BEFORE INSERT OR DELETE ON public.competition_participants
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_participants_freeze();

-- =========================
-- Competition Activities View
-- Activities that count in a competition:
-- same sport, inside the period, done by a current participant
-- best_time: only activities at least as long as the reference distance
-- total_steps: only activities with a step count
-- =========================

CREATE VIEW public.competition_activities
WITH (security_invoker = true)
AS
SELECT
    c.id AS competition_id,
    a.id,
    a.user_id,
    a.name,
    a.sport,
    a.activity_date,
    a.distance,
    a.duration,
    a.elevation_gain,
    a.steps,
    a.photo_path,
    a.created_at
FROM public.competitions c
JOIN public.competition_participants p ON p.competition_id = c.id
JOIN public.activities a
    ON a.user_id = p.user_id
    AND a.sport = c.sport
    AND a.activity_date BETWEEN c.start_date AND c.end_date
    AND (c.type <> 'best_time' OR a.distance >= c.target_distance)
    AND (c.type <> 'total_steps' OR a.steps IS NOT NULL);

-- =========================
-- Competition Standings View
-- score: km, count, m, steps, or seconds for best_time (prorated to the reference distance)
-- rank: standard competition ranking (ties share a rank), NULL without result
-- =========================

CREATE VIEW public.competition_standings
WITH (security_invoker = true)
AS
WITH scores AS (
    SELECT
        p.competition_id,
        p.user_id,
        c.type,
        COUNT(a.id)::INTEGER AS activity_count,
        NULLIF(
            CASE c.type
                WHEN 'total_distance' THEN SUM(a.distance)
                WHEN 'longest_distance' THEN MAX(a.distance)
                WHEN 'activity_count' THEN COUNT(a.id)
                WHEN 'best_time' THEN MIN(ROUND(a.duration * c.target_distance / a.distance))
                WHEN 'total_elevation' THEN SUM(a.elevation_gain)
                WHEN 'best_elevation' THEN MAX(a.elevation_gain)
                WHEN 'total_steps' THEN SUM(a.steps)
            END,
            0
        ) AS score
    FROM public.competition_participants p
    JOIN public.competitions c ON c.id = p.competition_id
    LEFT JOIN public.competition_activities a
        ON a.competition_id = p.competition_id
        AND a.user_id = p.user_id
    GROUP BY p.competition_id, p.user_id, c.id
)
SELECT
    competition_id,
    user_id,
    score,
    activity_count,
    (
        CASE WHEN score IS NOT NULL THEN
            RANK() OVER (
                PARTITION BY competition_id
                ORDER BY CASE WHEN type = 'best_time' THEN score ELSE -score END
            )
        END
    )::INTEGER AS rank,
    (COUNT(*) OVER (PARTITION BY competition_id))::INTEGER AS participant_count
FROM scores;

-- =========================
-- User Palmares
-- Aggregated results of the finished competitions of any user
-- Security definer: competitions of other users are private, only totals are exposed
-- Competitions with a single participant are ignored
-- =========================

CREATE FUNCTION public.get_user_palmares(p_user_id UUID)
RETURNS TABLE (
    sport TEXT,
    type TEXT,
    played INTEGER,
    wins INTEGER,
    podiums INTEGER,
    ranked INTEGER,
    rank_sum INTEGER
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT
        c.sport,
        c.type,
        COUNT(*)::INTEGER,
        (COUNT(*) FILTER (WHERE s.rank = 1))::INTEGER,
        (COUNT(*) FILTER (WHERE s.rank <= 3))::INTEGER,
        COUNT(s.rank)::INTEGER,
        COALESCE(SUM(s.rank), 0)::INTEGER
    FROM public.competition_standings s
    JOIN public.competitions c ON c.id = s.competition_id
    WHERE s.competition_id = ANY (
        ARRAY(
            SELECT cp.competition_id
            FROM public.competition_participants cp
            WHERE cp.user_id = p_user_id
        )
    )
    AND s.user_id = p_user_id
    AND s.participant_count >= 2
    AND c.end_date < public.app_today()
    GROUP BY c.sport, c.type;
$$;

REVOKE EXECUTE ON FUNCTION public.get_user_palmares(UUID) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_user_palmares(UUID) TO authenticated;

-- =========================
-- Privileges
-- =========================

REVOKE ALL ON public.competition_activities FROM anon;
GRANT SELECT ON public.competition_activities TO authenticated;

REVOKE ALL ON public.competition_standings FROM anon;
GRANT SELECT ON public.competition_standings TO authenticated;