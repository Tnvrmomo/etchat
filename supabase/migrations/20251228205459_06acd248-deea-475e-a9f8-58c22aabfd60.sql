-- Fix 1: Make chat-attachments bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'chat-attachments';

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view chat attachments" ON storage.objects;

-- Create proper RLS policy for authenticated conversation participants only
CREATE POLICY "Authenticated users can view chat attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'chat-attachments');

-- Fix 2: Add authorization to SECURITY DEFINER functions by revoking public execute
-- These functions are only used internally by RLS policies
REVOKE EXECUTE ON FUNCTION public.is_conversation_participant(uuid, uuid) FROM public;
REVOKE EXECUTE ON FUNCTION public.is_call_participant(uuid, uuid) FROM public;
REVOKE EXECUTE ON FUNCTION public.is_call_creator(uuid, uuid) FROM public;
REVOKE EXECUTE ON FUNCTION public.get_user_conversation_ids(uuid) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.get_user_call_ids(uuid) FROM public, anon;
REVOKE EXECUTE ON FUNCTION public.is_conversation_creator(uuid, uuid) FROM public;
REVOKE EXECUTE ON FUNCTION public.shares_conversation_with(uuid, uuid) FROM public;

-- Grant execute only to authenticated users (needed for RLS policies)
GRANT EXECUTE ON FUNCTION public.is_conversation_participant(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_call_participant(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_call_creator(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_conversation_ids(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_call_ids(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_conversation_creator(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.shares_conversation_with(uuid, uuid) TO authenticated;