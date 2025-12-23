-- Ensure call_signals has proper indexes for real-time filtering
CREATE INDEX IF NOT EXISTS idx_call_signals_to_user ON public.call_signals(to_user_id);
CREATE INDEX IF NOT EXISTS idx_call_signals_call_id ON public.call_signals(call_id);
CREATE INDEX IF NOT EXISTS idx_call_participants_user_id ON public.call_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_call_participants_status ON public.call_participants(status);