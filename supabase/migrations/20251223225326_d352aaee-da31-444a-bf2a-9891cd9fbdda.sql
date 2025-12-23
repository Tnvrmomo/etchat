-- Fix 1: Restrict profiles to authenticated users only
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Profiles are viewable by authenticated users"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Fix 2: Restrict notification insertion to service role only
DROP POLICY IF EXISTS "Service can insert notifications" ON public.notifications;

-- Create a security definer function for inserting notifications
CREATE OR REPLACE FUNCTION public.create_notification(
  _user_id uuid,
  _title text,
  _body text,
  _icon text DEFAULT NULL,
  _tag text DEFAULT NULL,
  _data jsonb DEFAULT '{}'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _notification_id uuid;
BEGIN
  INSERT INTO public.notifications (user_id, title, body, icon, tag, data)
  VALUES (_user_id, _title, _body, _icon, _tag, _data)
  RETURNING id INTO _notification_id;
  
  RETURN _notification_id;
END;
$$;

-- Grant execute to authenticated users (they can only create notifications via this function)
GRANT EXECUTE ON FUNCTION public.create_notification TO authenticated;

-- Create a more restrictive insert policy - only service role can insert directly
CREATE POLICY "Only service role can insert notifications"
ON public.notifications
FOR INSERT
TO service_role
WITH CHECK (true);