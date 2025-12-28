-- Enable realtime for call_participants to get proper incoming call notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.call_participants;

-- Add group call support
ALTER TABLE public.calls ADD COLUMN IF NOT EXISTS is_group_call boolean DEFAULT false;

-- Create contacts table for contact management
CREATE TABLE public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  contact_user_id uuid NOT NULL,
  nickname text,
  is_favorite boolean DEFAULT false,
  is_blocked boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, contact_user_id)
);

-- Enable RLS on contacts
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Contacts policies - users can only see/manage their own contacts
CREATE POLICY "Users can view their own contacts"
ON public.contacts
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can add contacts"
ON public.contacts
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own contacts"
ON public.contacts
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own contacts"
ON public.contacts
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Enable realtime for contacts
ALTER PUBLICATION supabase_realtime ADD TABLE public.contacts;

-- Add trigger for updated_at on contacts
CREATE TRIGGER update_contacts_updated_at
BEFORE UPDATE ON public.contacts
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();