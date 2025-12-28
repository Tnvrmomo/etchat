import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schemas
const uuidSchema = z.string().uuid();
const callTypeSchema = z.enum(['voice', 'video']);
const signalTypeSchema = z.enum(['offer', 'answer', 'ice-candidate']);

const createCallSchema = z.object({
  action: z.literal('create-call'),
  callType: callTypeSchema.optional().default('voice'),
  targetUserId: uuidSchema.optional(),
  conversationId: uuidSchema.optional(),
});

const joinCallSchema = z.object({
  action: z.literal('join-call'),
  callId: uuidSchema,
});

const sendSignalSchema = z.object({
  action: z.literal('send-signal'),
  callId: uuidSchema,
  targetUserId: uuidSchema,
  signalType: signalTypeSchema,
  signalData: z.record(z.unknown()).refine(
    (data) => JSON.stringify(data).length < 50000,
    { message: 'Signal data too large' }
  ),
});

const endCallSchema = z.object({
  action: z.literal('end-call'),
  callId: uuidSchema,
});

const rejectCallSchema = z.object({
  action: z.literal('reject-call'),
  callId: uuidSchema,
});

const payloadSchema = z.discriminatedUnion('action', [
  createCallSchema,
  joinCallSchema,
  sendSignalSchema,
  endCallSchema,
  rejectCallSchema,
]);

// Sanitize error messages to prevent information leakage
function sanitizeError(error: unknown): string {
  console.error('[Internal Error]:', error);
  
  if (error instanceof z.ZodError) {
    return 'Invalid request parameters';
  }
  
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes('unauthorized') || msg.includes('auth')) {
      return 'Authentication failed';
    }
    if (msg.includes('not found')) {
      return 'Resource not found';
    }
    if (msg.includes('missing') || msg.includes('required')) {
      return 'Missing required parameters';
    }
  }
  
  return 'An error occurred processing your request';
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
      console.log('No authorization header provided');
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
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
      console.error('Auth error:', userError?.message);
      return new Response(JSON.stringify({ error: 'Authentication failed' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse and validate input
    const rawPayload = await req.json();
    const parseResult = payloadSchema.safeParse(rawPayload);
    
    if (!parseResult.success) {
      console.error('Validation error:', parseResult.error.errors);
      return new Response(
        JSON.stringify({ error: 'Invalid request parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload = parseResult.data;
    console.log(`Signaling action: ${payload.action} from user: ${user.id}`);

    switch (payload.action) {
      case 'create-call': {
        // Create a new call
        const { data: call, error: callError } = await supabase
          .from('calls')
          .insert({
            caller_id: user.id,
            call_type: payload.callType,
            conversation_id: payload.conversationId,
            status: 'ringing',
          })
          .select()
          .single();

        if (callError) {
          console.error('Error creating call:', callError.message);
          throw new Error('Failed to create call');
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

          // Create notification for the target user
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
            _title: `Incoming ${payload.callType} call`,
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
        // Store signal in database (will be picked up via realtime)
        const { error: signalError } = await supabase.from('call_signals').insert({
          call_id: payload.callId,
          from_user_id: user.id,
          to_user_id: payload.targetUserId,
          signal_type: payload.signalType,
          signal_data: payload.signalData,
        });

        if (signalError) {
          console.error('Error sending signal:', signalError.message);
          throw new Error('Failed to send signal');
        }

        console.log(`Signal ${payload.signalType} sent from ${user.id} to ${payload.targetUserId}`);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'end-call': {
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
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    const safeMessage = sanitizeError(error);
    return new Response(JSON.stringify({ error: safeMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
