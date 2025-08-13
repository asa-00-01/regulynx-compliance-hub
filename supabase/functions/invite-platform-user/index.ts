import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type PlatformRole = 'platform_admin' | 'platform_support';

interface InviteRequest {
  email: string;
  role: PlatformRole;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, role }: InviteRequest = await req.json();

    if (!email || !role) {
      return new Response(JSON.stringify({ error: 'Missing email or role' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: 'Missing server environment configuration' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
      },
    });

    // Try to find existing profile by email
    const { data: existingProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .ilike('email', email)
      .maybeSingle();

    if (profileError && profileError.code !== 'PGRST116') {
      // PGRST116 is "Results contain 0 rows" which is fine for maybeSingle
      console.warn('Profile lookup error:', profileError);
    }

    let userId: string | null = existingProfile?.id ?? null;

    if (!userId) {
      // Create auth user and send invite email (if configured)
      const { data: createdUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: false,
        user_metadata: {
          source: 'platform_invite',
        },
        app_metadata: {
          roles: ['platform_pending'],
        },
      });

      if (createError) {
        console.error('Failed to create auth user:', createError);
        return new Response(JSON.stringify({ error: createError.message || 'Failed to create user' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      userId = createdUser.user?.id ?? null;

      // Best-effort: send invite email; ignore failures so role assignment can still proceed
      try {
        // This requires SMTP configured in the Supabase project
        await supabaseAdmin.auth.admin.inviteUserByEmail(email);
      } catch (inviteError) {
        console.warn('Invite email failed or not configured:', inviteError);
      }
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User identifier not available after creation' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Assign the platform role (ignore duplicate constraint)
    const { error: roleError } = await supabaseAdmin
      .from('platform_roles')
      .insert({ user_id: userId, role });

    if (roleError && roleError.code !== '23505') {
      console.error('Failed to assign platform role:', roleError);
      return new Response(JSON.stringify({ error: roleError.message || 'Failed to assign platform role' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Return minimal payload
    return new Response(JSON.stringify({ success: true, userId }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);


