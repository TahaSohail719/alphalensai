import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ALLOWED_CATEGORIES = ['general', 'forex', 'crypto', 'merger'] as const;

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body for category parameter
    const { category = 'general' } = req.method === 'POST' 
      ? await req.json().catch(() => ({ category: 'general' }))
      : { category: 'general' };

    // Validate category
    if (!ALLOWED_CATEGORIES.includes(category as any)) {
      return new Response(
        JSON.stringify({ 
          error: `Invalid category. Must be one of: ${ALLOWED_CATEGORIES.join(', ')}` 
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const FINNHUB_API_KEY = Deno.env.get('FINNHUB_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!FINNHUB_API_KEY) {
      throw new Error('FINNHUB_API_KEY not configured');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Check last refresh time FOR THIS CATEGORY
    const { data: lastNews } = await supabase
      .from('news_feed')
      .select('created_at')
      .eq('category', category)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const now = Date.now();
    const lastRefresh = lastNews ? new Date(lastNews.created_at).getTime() : 0;
    const TTL_MS = 30 * 60 * 1000; // 30 minutes

    // If cache is still fresh, return cached data FOR THIS CATEGORY
    if (now - lastRefresh < TTL_MS) {
      console.log(`⚡ Returning cached news data for category: ${category}`);
      const { data } = await supabase
        .from('news_feed')
        .select('*')
        .eq('category', category)
        .order('datetime', { ascending: false })
        .limit(20);
      
      return new Response(JSON.stringify({ data, cached: true, category }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch fresh news from Finnhub WITH DYNAMIC CATEGORY
    console.log(`🔄 Fetching fresh news from Finnhub for category: ${category}...`);
    const finnhubRes = await fetch(
      `https://finnhub.io/api/v1/news?category=${category}&token=${FINNHUB_API_KEY}`
    );
    
    if (!finnhubRes.ok) {
      throw new Error(`Finnhub API error: ${finnhubRes.status}`);
    }

    const newsData = await finnhubRes.json();
    const top20 = newsData.slice(0, 20);

    // Clear old news from THIS CATEGORY (> 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    await supabase
      .from('news_feed')
      .delete()
      .eq('category', category)
      .lt('created_at', sevenDaysAgo);

    // Insert fresh news
    const newsToInsert = top20.map((item: any) => ({
      id: item.id,
      category: category,
      datetime: new Date(item.datetime * 1000).toISOString(),
      headline: item.headline,
      image: item.image || null,
      source: item.source,
      summary: item.summary || '',
      url: item.url,
    }));

    const { error: insertError } = await supabase.from('news_feed').insert(newsToInsert);
    
    if (insertError) {
      console.error('Insert error:', insertError);
      throw insertError;
    }

    const { data } = await supabase
      .from('news_feed')
      .select('*')
      .eq('category', category)
      .order('datetime', { ascending: false })
      .limit(20);

    console.log(`✅ Successfully refreshed ${data?.length || 0} news items for category: ${category}`);

    return new Response(JSON.stringify({ data, cached: false, category }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error refreshing news:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
