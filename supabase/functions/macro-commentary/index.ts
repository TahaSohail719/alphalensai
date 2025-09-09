import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('📊 [macro-commentary] Edge function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { instrument, customNote, mode, type } = await req.json();
    
    console.log('📊 [macro-commentary] Request payload:', { instrument, customNote, mode, type });

    // Prepare the payload for n8n webhook
    const n8nPayload = {
      type: "RAG",
      question: customNote || `Market analysis for ${instrument}`,
      mode: "run",
      instrument: instrument,
      timeframe: "4h",
      assetType: "currency", 
      analysisDepth: "detailed",
      period: "weekly",
      adresse: ""
    };

    console.log('📊 [macro-commentary] Calling n8n webhook with:', n8nPayload);

    // Call the n8n webhook
    const n8nResponse = await fetch('https://dorian68.app.n8n.cloud/webhook/4572387f-700e-4987-b768-d98b347bd7f1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(n8nPayload)
    });

    if (!n8nResponse.ok) {
      console.error('📊 [macro-commentary] N8n webhook failed:', n8nResponse.status);
      throw new Error(`N8n webhook failed with status ${n8nResponse.status}`);
    }

    const n8nResult = await n8nResponse.json();
    console.log('📊 [macro-commentary] N8n response:', n8nResult);

    return new Response(
      JSON.stringify(n8nResult),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('📊 [macro-commentary] Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process macro commentary request',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
})