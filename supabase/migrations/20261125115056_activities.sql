-- =========================
-- Sports Table
-- Reference data: supported sports
-- =========================

CREATE TABLE public.sports
(
    id TEXT PRIMARY KEY
);

INSERT INTO public.sports (id)
VALUES ('running'), ('cycling'), ('walking');

ALTER TABLE public.sports ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.sports FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.sports FROM authenticated;

CREATE POLICY "Authenticated users can view sports"
    ON public.sports
    FOR SELECT
    TO authenticated
    USING (true);

ALTER TABLE public.competition_types
    ADD CONSTRAINT competition_types_sport_fkey FOREIGN KEY (sport) REFERENCES public.sports (id);

-- =========================
-- Activities Table
-- duration is stored in seconds
-- =========================

CREATE TABLE public.activities
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL DEFAULT auth.uid(),
    name TEXT NOT NULL,
    sport TEXT NOT NULL,
    activity_date DATE NOT NULL,
    distance NUMERIC(6, 2) NOT NULL,
    duration INTEGER NOT NULL,
    elevation_gain INTEGER NOT NULL DEFAULT 0,
    steps INTEGER,
    photo_path TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT activities_user_fkey FOREIGN KEY (user_id) REFERENCES public.profiles (id) ON DELETE CASCADE,
    CONSTRAINT activities_sport_fkey FOREIGN KEY (sport) REFERENCES public.sports (id),
    CONSTRAINT activities_name_length CHECK (char_length(btrim(name)) BETWEEN 1 AND 60),
    CONSTRAINT activities_distance_range CHECK (distance BETWEEN 0.01 AND 1000),
    CONSTRAINT activities_duration_range CHECK (duration BETWEEN 60 AND 172800),
    CONSTRAINT activities_elevation_gain_range CHECK (elevation_gain BETWEEN 0 AND 20000),
    CONSTRAINT activities_steps_check CHECK (steps IS NULL OR (sport = 'walking' AND steps BETWEEN 0 AND 200000)),
    CONSTRAINT activities_photo_path_check CHECK (photo_path LIKE user_id::TEXT || '/%')
);

CREATE INDEX activities_user_date_idx ON public.activities (user_id, activity_date DESC);
CREATE INDEX activities_sport_date_idx ON public.activities (sport, activity_date);

-- =========================
-- Trigger updated_at
-- =========================

CREATE TRIGGER activities_set_updated_at
    BEFORE UPDATE ON public.activities
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- Is an activity locked
-- Locked once a competition it counts in is over for more than 24h
-- =========================

CREATE FUNCTION public.is_activity_locked(p_user_id UUID, p_sport TEXT, p_date DATE)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.competitions c
        JOIN public.competition_participants p ON p.competition_id = c.id
        WHERE p.user_id = p_user_id
        AND c.sport = p_sport
        AND p_date BETWEEN c.start_date AND c.end_date
        AND c.end_date + 1 < public.app_today()
    );
$$;

REVOKE EXECUTE ON FUNCTION public.is_activity_locked(UUID, TEXT, DATE) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.is_activity_locked(UUID, TEXT, DATE) TO authenticated;

-- =========================
-- Trigger activities rules
-- =========================

CREATE FUNCTION public.enforce_activity_rules()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        -- Cascades (account deletion) are never blocked
        IF pg_trigger_depth() > 1 THEN
            RETURN OLD;
        END IF;

        IF public.is_activity_locked(OLD.user_id, OLD.sport, OLD.activity_date) THEN
            RAISE EXCEPTION 'activity_locked';
        END IF;

        RETURN OLD;
    END IF;

    IF (TG_OP = 'INSERT' OR NEW.activity_date IS DISTINCT FROM OLD.activity_date)
        AND NEW.activity_date > public.app_today() THEN
        RAISE EXCEPTION 'activity_date_in_future';
    END IF;

    IF TG_OP = 'UPDATE'
        AND public.is_activity_locked(OLD.user_id, OLD.sport, OLD.activity_date) THEN
        RAISE EXCEPTION 'activity_locked';
    END IF;

    IF public.is_activity_locked(NEW.user_id, NEW.sport, NEW.activity_date) THEN
        RAISE EXCEPTION 'activity_locked';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER activities_enforce_rules
    BEFORE INSERT OR UPDATE OR DELETE ON public.activities
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_activity_rules();

-- =========================
-- Privileges
-- user_id can never be updated
-- =========================

REVOKE ALL ON public.activities FROM anon;
REVOKE UPDATE ON public.activities FROM authenticated;
GRANT UPDATE (name, sport, activity_date, distance, duration, elevation_gain, steps, photo_path) ON public.activities TO authenticated;

-- =========================
-- Row Level Security
-- =========================

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all activities"
    ON public.activities
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create their own activities"
    ON public.activities
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own activities"
    ON public.activities
    FOR UPDATE
    TO authenticated
    USING (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own activities"
    ON public.activities
    FOR DELETE
    TO authenticated
    USING (user_id = (SELECT auth.uid()));

-- =========================
-- Activity Photos Storage
-- Files are stored as <user_id>/<filename>
-- =========================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('activity-photos', 'activity-photos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can view activity photos"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (bucket_id = 'activity-photos');

CREATE POLICY "Users can upload their own activity photos"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'activity-photos' AND (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT);

CREATE POLICY "Users can update their own activity photos"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'activity-photos' AND (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT)
    WITH CHECK (bucket_id = 'activity-photos' AND (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT);

CREATE POLICY "Users can delete their own activity photos"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'activity-photos' AND (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT);