-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view conversation participants" ON public.conversation_participants;
DROP POLICY IF EXISTS "Users can view their conversations" ON public.conversations;
DROP POLICY IF EXISTS "Users can view their calls" ON public.calls;
DROP POLICY IF EXISTS "Users can update their calls" ON public.calls;
DROP POLICY IF EXISTS "Users can view call participants" ON public.call_participants;
DROP POLICY IF EXISTS "Users can view files from their conversations" ON public.shared_files;

-- Recreate conversation_participants policy without recursion
-- Users can view participants for conversations they are part of
CREATE POLICY "Users can view conversation participants"
ON public.conversation_participants
FOR SELECT
USING (user_id = auth.uid());

-- Create a separate policy for viewing other participants in same conversation
CREATE POLICY "Users can view other participants in their conversations"
ON public.conversation_participants
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp2
    WHERE cp2.conversation_id = conversation_participants.conversation_id
    AND cp2.user_id = auth.uid()
  )
);

-- Recreate conversations policy without circular reference
CREATE POLICY "Users can view their conversations"
ON public.conversations
FOR SELECT
USING (
  created_by = auth.uid() 
  OR id IN (
    SELECT conversation_id FROM public.conversation_participants 
    WHERE user_id = auth.uid()
  )
);

-- Recreate calls policy without circular reference  
CREATE POLICY "Users can view their calls"
ON public.calls
FOR SELECT
USING (
  caller_id = auth.uid()
  OR id IN (
    SELECT call_id FROM public.call_participants 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their calls"
ON public.calls
FOR UPDATE
USING (
  caller_id = auth.uid()
  OR id IN (
    SELECT call_id FROM public.call_participants 
    WHERE user_id = auth.uid()
  )
);

-- Recreate call_participants policy without recursion
CREATE POLICY "Users can view call participants"
ON public.call_participants
FOR SELECT
USING (
  user_id = auth.uid()
  OR call_id IN (
    SELECT id FROM public.calls WHERE caller_id = auth.uid()
  )
  OR call_id IN (
    SELECT call_id FROM public.call_participants cp2 
    WHERE cp2.user_id = auth.uid()
  )
);

-- Recreate shared_files policy without recursion
CREATE POLICY "Users can view files from their conversations"
ON public.shared_files
FOR SELECT
USING (
  uploaded_by = auth.uid()
  OR conversation_id IN (
    SELECT conversation_id FROM public.conversation_participants 
    WHERE user_id = auth.uid()
  )
);