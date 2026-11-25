-- =========================
-- Friendships Table
-- =========================

CREATE TABLE public.friendships
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL,
    addressee_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT friendships_requester_fkey FOREIGN KEY (requester_id) REFERENCES public.profiles (id) ON DELETE CASCADE,
    CONSTRAINT friendships_addressee_fkey FOREIGN KEY (addressee_id) REFERENCES public.profiles (id) ON DELETE CASCADE,
    CONSTRAINT friendships_status_check CHECK (status IN ('pending', 'accepted')),
    CONSTRAINT friendships_not_self CHECK (requester_id <> addressee_id)
);

-- =========================
-- Indexes
-- =========================

CREATE UNIQUE INDEX friendships_pair_key
    ON public.friendships (least(requester_id, addressee_id), greatest(requester_id, addressee_id));

CREATE INDEX friendships_requester_idx ON public.friendships (requester_id);
CREATE INDEX friendships_addressee_idx ON public.friendships (addressee_id);

-- =========================
-- Trigger updated_at
-- =========================

CREATE TRIGGER friendships_set_updated_at
    BEFORE UPDATE ON public.friendships
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- Privileges
-- =========================

REVOKE ALL ON public.friendships FROM anon;
REVOKE UPDATE ON public.friendships FROM authenticated;
GRANT UPDATE (status) ON public.friendships TO authenticated;

-- =========================
-- Row Level Security
-- =========================

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own friendships"
    ON public.friendships
    FOR SELECT
    TO authenticated
    USING ((SELECT auth.uid()) IN (requester_id, addressee_id));

CREATE POLICY "Users can send friend requests"
    ON public.friendships
    FOR INSERT
    TO authenticated
    WITH CHECK ((SELECT auth.uid()) = requester_id AND status = 'pending');

CREATE POLICY "Users can accept received friend requests"
    ON public.friendships
    FOR UPDATE
    TO authenticated
    USING ((SELECT auth.uid()) = addressee_id AND status = 'pending')
    WITH CHECK ((SELECT auth.uid()) = addressee_id AND status = 'accepted');

CREATE POLICY "Users can delete their own friendships"
    ON public.friendships
    FOR DELETE
    TO authenticated
    USING ((SELECT auth.uid()) IN (requester_id, addressee_id));