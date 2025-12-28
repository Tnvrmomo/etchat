import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SignalPayload {
  action: 'create-call' | 'join-call' | 'send-signal' | 'end-call' | 'reject-call';
  callId?: string;
  callType?: 'voice' | 'video';
  targetUserId?: string;
  signalType?: 'offer' | 'answer' | 'ice-candidate';
  signalData?: any;
  conversationId?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Get auth token from request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create client with user's token
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload: SignalPayload = await req.json();
    console.log(`Signaling action: ${payload.action} from user: ${user.id}`);

    switch (payload.action) {
      case 'create-call': {
        // Create a new call
        const { data: call, error: callError } = await supabase
          .from('calls')
          .insert({
            caller_id: user.id,
            call_type: payload.callType || 'voice',
            conversation_id: payload.conversationId,
            status: 'ringing',
          })
          .select()
          .single();

        if (callError) {
          console.error('Error creating call:', callError);
          throw callError;
        }

        // Add caller as participant
        await supabase.from('call_participants').insert({
          call_id: call.id,
          user_id: user.id,
          status: 'joined',
          joined_at: new Date().toISOString(),
        });

        // Add target user as participant if specified
        if (payload.targetUserId) {
          await supabase.from('call_participants').insert({
            call_id: call.id,
            user_id: payload.targetUserId,
            status: 'ringing',
          });
        }

        // Create notification for the target user
        if (payload.targetUserId) {
          const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
          
          // Get caller profile
          const { data: callerProfile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('user_id', user.id)
            .single();
          
          const callerName = callerProfile?.display_name || 'Someone';
          
          await serviceClient.rpc('create_notification', {
            _user_id: payload.targetUserId,
            _title: `Incoming ${payload.callType || 'voice'} call`,
            _body: `${callerName} is calling you`,
            _icon: '📞',
            _tag: `call:${call.id}`,
            _data: { call_id: call.id, caller_id: user.id, call_type: payload.callType },
          });
        }

        console.log('Call created:', call.id);
        return new Response(JSON.stringify({ success: true, call }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'join-call': {
        if (!payload.callId) {
          throw new Error('Call ID is required');
        }

        // Update call status
        await supabase
          .from('calls')
          .update({ status: 'ongoing', started_at: new Date().toISOString() })
          .eq('id', payload.callId);

        // Update participant status
        await supabase
          .from('call_participants')
          .update({ status: 'joined', joined_at: new Date().toISOString() })
          .eq('call_id', payload.callId)
          .eq('user_id', user.id);

        console.log('User joined call:', payload.callId);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'send-signal': {
        if (!payload.callId || !payload.targetUserId || !payload.signalType || !payload.signalData) {
          throw new Error('Missing required signal parameters');
        }

        // Store signal in database (will be picked up via realtime)
        const { error: signalError } = await supabase.from('call_signals').insert({
          call_id: payload.callId,
          from_user_id: user.id,
          to_user_id: payload.targetUserId,
          signal_type: payload.signalType,
          signal_data: payload.signalData,
        });

        if (signalError) {
          console.error('Error sending signal:', signalError);
          throw signalError;
        }

        console.log(`Signal ${payload.signalType} sent from ${user.id} to ${payload.targetUserId}`);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'end-call': {
        if (!payload.callId) {
          throw new Error('Call ID is required');
        }

        // Update call status
        await supabase
          .from('calls')
          .update({ status: 'ended', ended_at: new Date().toISOString() })
          .eq('id', payload.callId);

        // Update participant status
        await supabase
          .from('call_participants')
          .update({ status: 'left', left_at: new Date().toISOString() })
          .eq('call_id', payload.callId)
          .eq('user_id', user.id);

        console.log('Call ended:', payload.callId);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'reject-call': {
        if (!payload.callId) {
          throw new Error('Call ID is required');
        }

        // Update participant status
        await supabase
          .from('call_participants')
          .update({ status: 'rejected' })
          .eq('call_id', payload.callId)
          .eq('user_id', user.id);

        // Check if all participants rejected - then mark call as rejected
        const { data: participants } = await supabase
          .from('call_participants')
          .select('status')
          .eq('call_id', payload.callId)
          .neq('status', 'joined');

        const allRejected = participants?.every(p => p.status === 'rejected');
        if (allRejected) {
          await supabase
            .from('calls')
            .update({ status: 'rejected', ended_at: new Date().toISOString() })
            .eq('id', payload.callId);
        }

        console.log('Call rejected by:', user.id);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error(`Unknown action: ${payload.action}`);
    }
  } catch (error) {
    console.error('Signaling error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
