-- =========================
-- Profiles Table
-- =========================

CREATE TABLE public.profiles
(
    id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT profiles_username_unique UNIQUE (username),
    CONSTRAINT profiles_username_format CHECK (username ~ '^[a-z0-9_]+$'),
    CONSTRAINT profiles_username_length CHECK (char_length(username) BETWEEN 3 AND 20),
    CONSTRAINT profiles_full_name_format CHECK (char_length(btrim(full_name)) BETWEEN 2 AND 100)
);

-- =========================
-- Trigger updated_at
-- =========================

CREATE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- =========================
-- Trigger new_user
-- =========================

CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (id, username, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data ->> 'username', btrim(NEW.raw_user_meta_data ->> 'full_name'));
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;

-- =========================
-- Row Level Security
-- =========================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all profiles"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (id = (SELECT auth.uid()))
	WITH CHECK (id = (SELECT auth.uid()));

-- =========================
-- Availability username
-- =========================

CREATE FUNCTION public.is_username_available(p_username TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
    SELECT NOT EXISTS (SELECT 1 FROM public.profiles WHERE username = lower(p_username));
$$;

GRANT EXECUTE ON FUNCTION public.is_username_available(TEXT) TO anon, authenticated;

-- =========================
-- Delete Current User
-- =========================

CREATE FUNCTION public.delete_account()
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
    DELETE FROM auth.users WHERE id = (SELECT auth.uid());
$$;

REVOKE EXECUTE ON FUNCTION public.delete_account() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.delete_account() TO authenticated;

-- =========================
-- Avatars Storage
-- =========================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can view avatars"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT);

CREATE POLICY "Users can update their own avatar"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT)
    WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT);

CREATE POLICY "Users can delete their own avatar"
    ON storage.objects
	FOR DELETE
	TO authenticated
	USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = (SELECT auth.uid())::TEXT);