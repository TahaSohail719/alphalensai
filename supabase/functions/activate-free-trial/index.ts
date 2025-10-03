import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ACTIVATE-FREE-TRIAL] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Create Supabase client with service role for admin operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user) throw new Error("User not authenticated");
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Update user profile to Free Trial
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({ user_plan: 'free_trial' })
      .eq('user_id', user.id);

    if (profileError) {
      logStep("ERROR updating profile", { message: profileError.message });
      throw new Error(`Failed to update profile: ${profileError.message}`);
    }
    logStep("Profile updated to free_trial");

    // Initialize Free Trial credits
    const { error: creditsError } = await supabaseClient.rpc('initialize_user_credits', {
      target_user_id: user.id,
      target_plan_type: 'free_trial'
    });

    if (creditsError) {
      logStep("ERROR initializing credits", { message: creditsError.message });
      throw new Error(`Failed to initialize credits: ${creditsError.message}`);
    }
    logStep("Credits initialized for free_trial");

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Free Trial activated successfully",
        user_id: user.id
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in activate-free-trial", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
