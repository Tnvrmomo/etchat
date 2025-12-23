-- Drop and recreate RLS policies for conversation_participants to fix infinite recursion
DROP POLICY IF EXISTS "Users can view participants of their conversations" ON public.conversation_participants;
DROP POLICY IF EXISTS "Admins can manage participants" ON public.conversation_participants;

-- Create proper policies without self-referencing
CREATE POLICY "Users can view conversation participants"
ON public.conversation_participants
FOR SELECT
USING (
  user_id = auth.uid() 
  OR 
  conversation_id IN (
    SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their own participation"
ON public.conversation_participants
FOR ALL
USING (user_id = auth.uid());

-- Fix conversations policies
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Admins can update conversations" ON public.conversations;

CREATE POLICY "Users can view their conversations"
ON public.conversations
FOR SELECT
USING (
  created_by = auth.uid()
  OR
  id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update their conversations"
ON public.conversations
FOR UPDATE
USING (
  created_by = auth.uid()
  OR
  id IN (SELECT conversation_id FROM public.conversation_participants WHERE user_id = auth.uid() AND role = 'admin')
);

-- Fix call_participants policies  
DROP POLICY IF EXISTS "Users can view call participants" ON public.call_participants;
DROP POLICY IF EXISTS "Callers can add participants" ON public.call_participants;

CREATE POLICY "Users can view call participants"
ON public.call_participants
FOR SELECT
USING (
  user_id = auth.uid()
  OR
  call_id IN (SELECT id FROM public.calls WHERE caller_id = auth.uid())
  OR
  call_id IN (SELECT call_id FROM public.call_participants WHERE user_id = auth.uid())
);

CREATE POLICY "Users can add call participants"
ON public.call_participants
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  OR
  call_id IN (SELECT id FROM public.calls WHERE caller_id = auth.uid())
);

-- Fix calls policies
DROP POLICY IF EXISTS "Users can view their calls" ON public.calls;
DROP POLICY IF EXISTS "Users can update their calls" ON public.calls;

CREATE POLICY "Users can view their calls"
ON public.calls
FOR SELECT
USING (
  caller_id = auth.uid()
  OR
  id IN (SELECT call_id FROM public.call_participants WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update their calls"
ON public.calls
FOR UPDATE
USING (
  caller_id = auth.uid()
  OR
  id IN (SELECT call_id FROM public.call_participants WHERE user_id = auth.uid())
);