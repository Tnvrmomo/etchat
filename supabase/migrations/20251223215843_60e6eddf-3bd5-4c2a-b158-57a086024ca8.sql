-- Create storage bucket for chat attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-attachments',
  'chat-attachments',
  true,
  52428800,  -- 50MB limit
  ARRAY['image/*', 'video/*', 'audio/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'chat-attachments');

-- Allow authenticated users to view all attachments
CREATE POLICY "Authenticated users can view attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'chat-attachments');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete own attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'chat-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create a files table to track shared files
CREATE TABLE IF NOT EXISTS public.shared_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  size BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  uploaded_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shared_files ENABLE ROW LEVEL SECURITY;

-- Users can view files from their conversations
CREATE POLICY "Users can view files from their conversations"
ON public.shared_files FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = shared_files.conversation_id
    AND cp.user_id = auth.uid()
  )
  OR uploaded_by = auth.uid()
);

-- Users can insert files they upload
CREATE POLICY "Users can upload files"
ON public.shared_files FOR INSERT
TO authenticated
WITH CHECK (uploaded_by = auth.uid());

-- Users can delete their own files
CREATE POLICY "Users can delete own files"
ON public.shared_files FOR DELETE
TO authenticated
USING (uploaded_by = auth.uid());

-- Add realtime for shared_files
ALTER PUBLICATION supabase_realtime ADD TABLE public.shared_files;