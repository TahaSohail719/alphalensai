import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Delete engaged credits older than 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: deletedCredits, error } = await supabase
      .from('credits_engaged')
      .delete()
      .lt('engaged_at', twentyFourHoursAgo)
      .select('id');

    if (error) {
      console.error('[Cleanup] Error deleting stale credits:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to cleanup stale credits', details: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const cleanedCount = deletedCredits?.length || 0;
    console.log(`[Cleanup] Successfully cleaned up ${cleanedCount} stale engaged credits`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        cleaned: cleanedCount,
        message: `Cleaned ${cleanedCount} stale engaged credits older than 24 hours`
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[Cleanup] Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});