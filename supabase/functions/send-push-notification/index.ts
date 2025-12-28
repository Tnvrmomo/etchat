import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const pushNotificationSchema = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(1000),
  icon: z.string().max(500).optional(),
  badge: z.string().max(500).optional(),
  tag: z.string().max(100).optional(),
  data: z.record(z.unknown()).optional(),
  requireInteraction: z.boolean().optional(),
});

type PushNotificationPayload = z.infer<typeof pushNotificationSchema>;

// Sanitize error messages to prevent information leakage
function sanitizeError(error: unknown): string {
  console.error('[Internal Error]:', error);
  
  if (error instanceof z.ZodError) {
    return 'Invalid request parameters';
  }
  
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes('not found')) {
      return 'Resource not found';
    }
    if (msg.includes('configuration') || msg.includes('configured')) {
      return 'Service temporarily unavailable';
    }
  }
  
  return 'An error occurred processing your request';
}

// Simple base64url encode/decode
function base64UrlEncode(data: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < data.length; i++) {
    binary += String.fromCharCode(data[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64UrlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.error('VAPID keys not configured');
      return new Response(
        JSON.stringify({ error: 'Service temporarily unavailable' }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate input
    const rawPayload = await req.json();
    const parseResult = pushNotificationSchema.safeParse(rawPayload);
    
    if (!parseResult.success) {
      console.error('Validation error:', parseResult.error.errors);
      return new Response(
        JSON.stringify({ error: 'Invalid request parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload: PushNotificationPayload = parseResult.data;
    console.log('Sending push notification to user:', payload.userId);

    // Get user's push subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', payload.userId);

    if (subError) {
      console.error('Error fetching subscriptions:', subError.message);
      throw new Error('Failed to fetch subscriptions');
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('No push subscriptions found for user:', payload.userId);
      return new Response(
        JSON.stringify({ success: false, message: 'No subscriptions found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${subscriptions.length} subscriptions for user`);

    // Sanitize notification content
    const sanitizedTitle = payload.title.slice(0, 200);
    const sanitizedBody = payload.body.slice(0, 1000);

    // Process subscriptions using background task
    const backgroundTask = async () => {
      const results = await Promise.allSettled(
        subscriptions.map(async (sub) => {
          try {
            console.log('Processing subscription:', sub.endpoint.substring(0, 50));
            
            // Store notification for the user (to be polled or used by service worker)
            const { error: notifError } = await supabase
              .from('notifications')
              .insert({
                user_id: payload.userId,
                title: sanitizedTitle,
                body: sanitizedBody,
                icon: payload.icon || '/et-chat-logo.jpg',
                tag: payload.tag,
                data: payload.data,
                read: false,
              });

            if (notifError) {
              console.error('Error storing notification:', notifError.message);
              return { endpoint: sub.endpoint, success: false };
            }

            return { endpoint: sub.endpoint, success: true };
          } catch (error) {
            console.error('Error processing subscription:', error);
            return { endpoint: sub.endpoint, success: false };
          }
        })
      );

      const successCount = results.filter(
        (r): r is PromiseFulfilledResult<{ endpoint: string; success: boolean }> => 
          r.status === 'fulfilled' && r.value.success
      ).length;
      
      console.log(`Push notification results: ${successCount}/${subscriptions.length} processed`);
    };

    // Run background task
    // Note: EdgeRuntime.waitUntil is not available in all environments
    // Running synchronously for reliability
    await backgroundTask();

    return new Response(
      JSON.stringify({ 
        success: true, 
        total: subscriptions.length,
        message: 'Notifications queued for delivery'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const safeMessage = sanitizeError(error);
    return new Response(
      JSON.stringify({ error: safeMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
