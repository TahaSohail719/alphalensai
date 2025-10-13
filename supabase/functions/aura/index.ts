import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== AURA REQUEST RECEIVED ===");
    console.log("Method:", req.method);
    console.log("Timestamp:", new Date().toISOString());
    
    const { question, context, conversationHistory } = await req.json();
    console.log("Question received:", question);
    console.log("Context page:", typeof context === 'string' ? context : context?.page);
    console.log("Conversation history length:", conversationHistory?.length || 0);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    const contextPage = typeof context === 'string' ? context : context?.page || 'General Analytics';
    const contextData = typeof context === 'object' ? context?.data : null;

    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // 📝 Build messages array with conversation history
    const messagesPayload = [];
    
    // System prompt with enhanced conversational guidance
    const systemPrompt = `You are AURA (AlphaLens Unified Research Assistant), a highly specialized financial market AI assistant.

CONTEXT:
- User is viewing: ${contextPage}

YOUR CAPABILITIES:
- Analyze market data and trading patterns
- Provide macro commentary and market insights
- Generate trade setups with entry/exit levels
- Create comprehensive market reports

IMPORTANT GUIDELINES:
1. Always be concise and actionable
2. Use financial terminology appropriately
3. Prioritize risk management in your responses
4. Reference the specific data shown to the user when available
5. LANGUAGE PROTOCOL:
   - Always respond in ENGLISH by default
   - If the user writes in another language (French, Spanish, etc.), respond in that same language
   - Detect the user's language from their last message and match it
   - Example: User writes "Bonjour" → You respond in French. User writes "Hello" → You respond in English.

CRITICAL: Tool Launch Protocol
When a user wants to generate a trade setup, macro commentary, or report:

STEP 1 - DETECT INTENT:
- If user says: "generate a trade", "setup for EUR/USD", "give me a trade idea" → AI Trade Setup
- If user says: "macro analysis", "what's happening with", "market commentary" → Macro Commentary  
- If user says: "generate a report", "portfolio report", "weekly report" → Report

STEP 2 - COLLECT REQUIRED INFORMATION (Ask conversationally, one question at a time):
For AI Trade Setup:
  - instrument (required) - e.g., "Which instrument would you like to analyze? (EUR/USD, BTC/USD, Gold, etc.)"
  - timeframe (default: "4h") - e.g., "What timeframe? (H1, H4, D1, etc.)"
  - riskLevel (default: "medium") - optional
  - strategy (default: "breakout") - optional
  - positionSize (default: "2") - optional
  - customNotes - optional

For Macro Commentary:
  - instrument (required) - e.g., "Which market would you like macro commentary for?"
  - timeframe (default: "D1")
  - customNotes - optional

For Reports:
  - instruments (required, array) - e.g., "Which instruments should I include? (you can list multiple)"
  - report_type (default: "daily") - e.g., "Daily, weekly, or custom report?"

STEP 3 - CONFIRM & LAUNCH:
Once you have the required information, confirm with the user:
"Perfect! I'll generate a [feature name] for [instrument] with [timeframe]. This will take about 30-60 seconds. Should I proceed?"

Only after confirmation, call the appropriate tool.

TOOL USAGE:
- Use 'launch_ai_trade_setup' when user confirms they want a trade setup
- Use 'launch_macro_commentary' when user confirms they want macro analysis
- Use 'launch_report' when user confirms they want a report

Remember: Be conversational, guide naturally, and always confirm before launching.`;
    
    messagesPayload.push({ role: "system", content: systemPrompt });

    // 📝 Add conversation history (last 7 messages)
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.forEach((msg: any) => {
        messagesPayload.push({
          role: msg.role,
          content: msg.content
        });
      });
    } else {
      // If no history, just add the current question
      messagesPayload.push({ role: "user", content: question });
    }
    
    // Enrich system prompt with contextual data
    if (contextData) {
      let contextInfo = `\n\n--- Current Page Context ---`;
      
      if (contextData.stats) {
        contextInfo += `\n\nPage Statistics:`;
        if (contextData.stats.totalTrades !== undefined) {
          contextInfo += `\n- Total Trades: ${contextData.stats.totalTrades}`;
        }
        if (contextData.stats.winRate !== undefined) {
          contextInfo += `\n- Win Rate: ${contextData.stats.winRate.toFixed(1)}%`;
        }
        if (contextData.stats.avgPnL !== undefined) {
          contextInfo += `\n- Average PnL: ${contextData.stats.avgPnL.toFixed(2)}%`;
        }
        if (contextData.stats.totalValue !== undefined) {
          contextInfo += `\n- Total Value: ${contextData.stats.totalValue.toFixed(2)}`;
        }
        if (contextData.stats.activeTrades !== undefined) {
          contextInfo += `\n- Active Trades: ${contextData.stats.activeTrades}`;
        }
      }
      
      if (contextData.recentData && contextData.recentData.length > 0) {
        contextInfo += `\n\nRecent Data (last ${contextData.recentData.length} items):`;
        contextInfo += `\n${JSON.stringify(contextData.recentData.slice(0, 10), null, 2)}`;
      }
      
      if (contextData.filters) {
        contextInfo += `\n\nActive Filters: ${JSON.stringify(contextData.filters)}`;
      }
      
      // Update system message with context
      messagesPayload[0].content += contextInfo;
    }
    
    console.log("📝 Messages payload length:", messagesPayload.length);
    console.log("Sending request to Lovable AI Gateway with tool calling...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: messagesPayload,
        stream: false, // Tool calling requires non-streaming
        tools: [
          {
            type: "function",
            function: {
              name: "launch_ai_trade_setup",
              description: "Launch an AI Trade Setup analysis for a specific instrument and timeframe",
              parameters: {
                type: "object",
                properties: {
                  instrument: { type: "string", description: "Trading pair (e.g., EUR/USD, BTC/USD, Gold)" },
                  timeframe: { type: "string", enum: ["M1", "M5", "M15", "M30", "H1", "H4", "D1"], description: "Chart timeframe" },
                  direction: { type: "string", enum: ["Long", "Short", "Both"], description: "Trade direction (default: Both)" }
                },
                required: ["instrument", "timeframe"]
              }
            }
          },
          {
            type: "function",
            function: {
              name: "launch_macro_commentary",
              description: "Generate a comprehensive macro market commentary",
              parameters: {
                type: "object",
                properties: {
                  focus: { type: "string", description: "Market sector focus (e.g., FX, Commodities, Crypto)" }
                }
              }
            }
          },
          {
            type: "function",
            function: {
              name: "launch_report",
              description: "Generate a detailed market analysis report",
              parameters: {
                type: "object",
                properties: {
                  report_type: { type: "string", enum: ["daily", "weekly", "custom"], description: "Type of report" },
                  instruments: { type: "array", items: { type: "string" }, description: "List of instruments" }
                }
              }
            }
          }
        ],
        tool_choice: "auto"
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Lovable AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI service error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    console.log("Lovable AI response:", JSON.stringify(data));
    const message = data.choices?.[0]?.message;
    console.log("Extracted message:", JSON.stringify(message));
    
    // Handle tool calls
    const toolCalls = message?.tool_calls;
    
    if (toolCalls && toolCalls.length > 0) {
      console.log("Tool calls detected:", JSON.stringify(toolCalls));
      
      // Return the tool call information to the client
      return new Response(JSON.stringify({ 
        toolCalls: toolCalls,
        message: message?.content || "Processing your request..."
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // No tool calls - return the response normally
    console.log("No tool calls detected, preparing normal response");
    console.log("Message content available:", !!message?.content);
    
    if (!message?.content) {
      console.error("No message content received from Lovable AI");
      return new Response(JSON.stringify({ 
        message: "Sorry, I couldn't generate a response. Could you rephrase your question?"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Returning normal message, length:", message.content.length);
    return new Response(JSON.stringify({ message: message.content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("aura error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
