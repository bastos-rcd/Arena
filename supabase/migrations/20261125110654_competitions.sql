-- =========================
-- Today (application timezone)
-- =========================

CREATE FUNCTION public.app_today()
RETURNS DATE
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
    SELECT (now() AT TIME ZONE 'Europe/Paris')::DATE;
$$;

-- =========================
-- Competition Types Table
-- Reference data: valid sport / type combinations
-- =========================

CREATE TABLE public.competition_types
(
    sport TEXT NOT NULL,
    type TEXT NOT NULL,

    PRIMARY KEY (sport, type)
);

INSERT INTO public.competition_types (sport, type)
VALUES
    ('running', 'total_distance'),
    ('running', 'longest_distance'),
    ('running', 'activity_count'),
    ('running', 'best_time'),
    ('running', 'total_elevation'),
    ('running', 'best_elevation'),
    ('cycling', 'total_distance'),
    ('cycling', 'longest_distance'),
    ('cycling', 'activity_count'),
    ('cycling', 'total_elevation'),
    ('cycling', 'best_elevation'),
    ('walking', 'total_steps'),
    ('walking', 'total_distance'),
    ('walking', 'longest_distance'),
    ('walking', 'total_elevation'),
    ('walking', 'best_elevation');

ALTER TABLE public.competition_types ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.competition_types FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.competition_types FROM authenticated;

CREATE POLICY "Authenticated users can view competition types"
    ON public.competition_types
    FOR SELECT
    TO authenticated
    USING (true);

-- =========================
-- Competitions Table
-- =========================

CREATE TABLE public.competitions
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL DEFAULT auth.uid(),
    name TEXT NOT NULL,
    description TEXT,
    sport TEXT NOT NULL,
    type TEXT NOT NULL,
    target_distance NUMERIC(6, 2),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT competitions_owner_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles (id) ON DELETE CASCADE,
    CONSTRAINT competitions_sport_type_fkey FOREIGN KEY (sport, type) REFERENCES public.competition_types (sport, type),
    CONSTRAINT competitions_name_length CHECK (char_length(btrim(name)) BETWEEN 3 AND 60),
    CONSTRAINT competitions_description_length CHECK (char_length(description) <= 500),
    CONSTRAINT competitions_target_distance_check CHECK ((type = 'best_time') = (target_distance IS NOT NULL)),
    CONSTRAINT competitions_target_distance_positive CHECK (target_distance IS NULL OR target_distance > 0),
    CONSTRAINT competitions_dates_check CHECK (end_date >= start_date)
);

CREATE INDEX competitions_owner_idx ON public.competitions (owner_id);

-- =========================
-- Competition Participants Table
-- =========================

CREATE TABLE public.competition_participants
(
    competition_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    PRIMARY KEY (competition_id, user_id),
    CONSTRAINT competition_participants_competition_fkey FOREIGN KEY (competition_id) REFERENCES public.competitions (id) ON DELETE CASCADE,
    CONSTRAINT competition_participants_user_fkey FOREIGN KEY (user_id) REFERENCES public.profiles (id) ON DELETE CASCADE
);

CREATE INDEX competition_participants_user_idx ON public.competition_participants (user_id);

-- =========================
-- Is current user a participant (bypasses RLS to avoid policy recursion)
-- =========================

CREATE FUNCTION public.is_competition_participant(p_competition_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.competition_participants
        WHERE competition_id = p_competition_id
        AND user_id = (SELECT auth.uid())
    );
$$;

REVOKE EXECUTE ON FUNCTION public.is_competition_participant(UUID) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.is_competition_participant(UUID) TO authenticated;

-- =========================
-- Trigger updated_at
-- =========================

CREATE TRIGGER competitions_set_updated_at
    BEFORE UPDATE ON public.competitions
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- Trigger dates rules
-- =========================

CREATE FUNCTION public.enforce_competition_dates()
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

CREATE TRIGGER competitions_enforce_dates
    BEFORE INSERT OR UPDATE ON public.competitions
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_competition_dates();

-- =========================
-- Trigger owner is a participant
-- =========================

CREATE FUNCTION public.add_owner_as_participant()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.competition_participants (competition_id, user_id)
    VALUES (NEW.id, NEW.owner_id);

    RETURN NEW;
END;
$$;

CREATE TRIGGER competitions_add_owner
    AFTER INSERT ON public.competitions
    FOR EACH ROW
    EXECUTE FUNCTION public.add_owner_as_participant();

REVOKE EXECUTE ON FUNCTION public.add_owner_as_participant() FROM public, anon, authenticated;

-- =========================
-- Privileges
-- sport, type, target_distance and owner_id can never be updated
-- =========================

REVOKE ALL ON public.competitions FROM anon;
REVOKE UPDATE ON public.competitions FROM authenticated;
GRANT UPDATE (name, description, start_date, end_date) ON public.competitions TO authenticated;

REVOKE ALL ON public.competition_participants FROM anon;
REVOKE UPDATE ON public.competition_participants FROM authenticated;

-- =========================
-- Row Level Security: competitions
-- =========================

ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view their competitions"
    ON public.competitions
    FOR SELECT
    TO authenticated
    USING (owner_id = (SELECT auth.uid()) OR public.is_competition_participant(id));

CREATE POLICY "Users can create their own competitions"
    ON public.competitions
    FOR INSERT
    TO authenticated
    WITH CHECK (owner_id = (SELECT auth.uid()));

CREATE POLICY "Owners can update their competitions"
    ON public.competitions
    FOR UPDATE
    TO authenticated
    USING (owner_id = (SELECT auth.uid()))
    WITH CHECK (owner_id = (SELECT auth.uid()));

CREATE POLICY "Owners can delete their competitions"
    ON public.competitions
    FOR DELETE
    TO authenticated
    USING (owner_id = (SELECT auth.uid()));

-- =========================
-- Row Level Security: participants
-- =========================

ALTER TABLE public.competition_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view participants of their competitions"
    ON public.competition_participants
    FOR SELECT
    TO authenticated
    USING (public.is_competition_participant(competition_id));

CREATE POLICY "Owners can add their friends as participants"
    ON public.competition_participants
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.competitions c
            WHERE c.id = competition_id
            AND c.owner_id = (SELECT auth.uid())
        )
        AND EXISTS (
            SELECT 1
            FROM public.friendships f
            WHERE f.status = 'accepted'
            AND (
                (f.requester_id = (SELECT auth.uid()) AND f.addressee_id = user_id)
                OR (f.addressee_id = (SELECT auth.uid()) AND f.requester_id = user_id)
            )
        )
    );

CREATE POLICY "Owners can remove participants other than themselves"
    ON public.competition_participants
    FOR DELETE
    TO authenticated
    USING (
        user_id <> (SELECT auth.uid())
        AND EXISTS (
            SELECT 1
            FROM public.competitions c
            WHERE c.id = competition_id
            AND c.owner_id = (SELECT auth.uid())
        )
    );

CREATE POLICY "Participants can leave a competition they do not own"
    ON public.competition_participants
    FOR DELETE
    TO authenticated
    USING (
        user_id = (SELECT auth.uid())
        AND EXISTS (
            SELECT 1
            FROM public.competitions c
            WHERE c.id = competition_id
            AND c.owner_id <> user_id
        )
    );