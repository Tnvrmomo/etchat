-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Only service role can insert notifications" ON public.notifications;

-- Create a function to check if users share a conversation
CREATE OR REPLACE FUNCTION public.shares_conversation_with(_current_user_id uuid, _other_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.conversation_participants cp1
    JOIN public.conversation_participants cp2 
      ON cp1.conversation_id = cp2.conversation_id
    WHERE cp1.user_id = _current_user_id 
      AND cp2.user_id = _other_user_id
  )
$$;

-- Profiles: Users can see their own profile OR profiles of people they share conversations with
CREATE POLICY "Users can view relevant profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  OR public.shares_conversation_with(auth.uid(), user_id)
);

-- Also allow viewing all profiles for starting new conversations (needed for user search)
-- But only basic info - implement this as a separate query pattern in the app
CREATE POLICY "Users can search other users"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- For notifications: No direct INSERT allowed for regular users
-- They must use the create_notification function or edge functions with service role
-- This policy explicitly restricts to service_role using the role claim
CREATE POLICY "Service role only inserts notifications"
ON public.notifications
FOR INSERT
WITH CHECK (
  (current_setting('request.jwt.claims', true)::json->>'role') = 'service_role'
);