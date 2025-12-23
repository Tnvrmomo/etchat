-- Drop the problematic policies we just created
DROP POLICY IF EXISTS "Users can view conversation participants" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can view other participants in their conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view their calls" ON public.calls;
DROP POLICY IF EXISTS "Users can update their calls" ON public.calls;
DROP POLICY IF EXISTS "Users can view call participants" ON public.call_participants;
DROP POLICY IF EXISTS "Users can view files from their conversations" ON public.shared_files;

-- Create security definer functions to avoid recursion

-- Function to check if user is participant in a conversation
CREATE OR REPLACE FUNCTION public.is_conversation_participant(_user_id uuid, _conversation_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE user_id = _user_id AND conversation_id = _conversation_id
  )
$$;

-- Function to check if user is participant in a call
CREATE OR REPLACE FUNCTION public.is_call_participant(_user_id uuid, _call_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.call_participants
    WHERE user_id = _user_id AND call_id = _call_id
  )
$$;

-- Function to check if user is the caller
CREATE OR REPLACE FUNCTION public.is_call_creator(_user_id uuid, _call_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.calls
    WHERE caller_id = _user_id AND id = _call_id
  )
$$;

-- Function to get user's conversation IDs
CREATE OR REPLACE FUNCTION public.get_user_conversation_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT conversation_id FROM public.conversation_participants
  WHERE user_id = _user_id
$$;

-- Function to get user's call IDs
CREATE OR REPLACE FUNCTION public.get_user_call_ids(_user_id uuid)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT call_id FROM public.call_participants
  WHERE user_id = _user_id
$$;

-- Recreate conversation_participants policies using security definer functions
CREATE POLICY "Users can view conversation participants"
ON public.conversation_participants
FOR SELECT
USING (
  user_id = auth.uid() 
  OR public.is_conversation_participant(auth.uid(), conversation_id)
);

-- Recreate conversations policy  
CREATE POLICY "Users can view their conversations"
ON public.conversations
FOR SELECT
USING (
  created_by = auth.uid() 
  OR id IN (SELECT public.get_user_conversation_ids(auth.uid()))
);

-- Recreate calls policies
CREATE POLICY "Users can view their calls"
ON public.calls
FOR SELECT
USING (
  caller_id = auth.uid()
  OR id IN (SELECT public.get_user_call_ids(auth.uid()))
);

CREATE POLICY "Users can update their calls"
ON public.calls
FOR UPDATE
USING (
  caller_id = auth.uid()
  OR id IN (SELECT public.get_user_call_ids(auth.uid()))
);

-- Recreate call_participants policy
CREATE POLICY "Users can view call participants"
ON public.call_participants
FOR SELECT
USING (
  user_id = auth.uid()
  OR public.is_call_creator(auth.uid(), call_id)
  OR public.is_call_participant(auth.uid(), call_id)
);

-- Recreate shared_files policy
CREATE POLICY "Users can view files from their conversations"
ON public.shared_files
FOR SELECT
USING (
  uploaded_by = auth.uid()
  OR conversation_id IN (SELECT public.get_user_conversation_ids(auth.uid()))
);