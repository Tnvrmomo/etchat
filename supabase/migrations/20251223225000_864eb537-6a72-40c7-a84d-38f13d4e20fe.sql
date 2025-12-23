-- Drop restrictive INSERT policy
DROP POLICY IF EXISTS "Users can join conversations they're invited to" ON public.conversation_participants;

-- Create a function to check if user created the conversation
CREATE OR REPLACE FUNCTION public.is_conversation_creator(_user_id uuid, _conversation_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversations
    WHERE id = _conversation_id AND created_by = _user_id
  )
$$;

-- Allow users to add participants if they created the conversation or adding themselves
CREATE POLICY "Users can add conversation participants"
ON public.conversation_participants
FOR INSERT
WITH CHECK (
  user_id = auth.uid() 
  OR public.is_conversation_creator(auth.uid(), conversation_id)
);

-- Also fix the add call participants policy
DROP POLICY IF EXISTS "Users can add call participants" ON public.call_participants;

CREATE POLICY "Users can add call participants"
ON public.call_participants
FOR INSERT
WITH CHECK (
  user_id = auth.uid() 
  OR public.is_call_creator(auth.uid(), call_id)
);