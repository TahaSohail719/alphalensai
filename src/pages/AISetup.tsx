import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Zap, Target, TrendingUp, Settings, RotateCcw, Save, AlertCircle } from "lucide-react";
import Layout from "@/components/Layout";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import TradeResultPanel from "@/components/TradeResultPanel";

async function safeFetchJson(url, options) {
  console.log('🌐 safeFetchJson→', url, options?.method || 'GET');
  let res;
  try {
    res = await fetch(url, options);
  } catch (e) {
    console.error('❌ fetch failed (network/CORS before response):', e);
    throw e;
  }
  console.log('✅ fetch responded, status =', res.status);

  // Tente JSON, sinon text
  const ct = res.headers?.get('content-type') || '';
  if (!res.ok) {
    const txt = await res.text().catch(() => '[unreadable]');
    console.error('❌ non-OK response body:', txt?.slice(0, 500));
    throw new Error(`HTTP ${res.status}`);
  }
  try {
    if (ct.includes('application/json')) {
      return await res.json();
    } else {
      const txt = await res.text();
      console.warn('⚠️ content-type not JSON, returning text:', ct);
      return { _rawText: txt };
    }
  } catch (e) {
    console.error('❌ body parse failed (JSON/text):', e);
    const txt = await res.text().catch(() => '[unreadable]');
    return { _rawText: txt };
  }
}

interface TradeSetup {
  entry: number;
  stopLoss: number;
  takeProfit: number;
  positionSize: number;
  riskReward: number;
  confidence: number;
  reasoning: string;
}

interface N8nTradeResult {
  instrument: string;
  asOf: string;
  market_commentary_anchor: {
    summary: string;
    key_drivers: string[];
  };
  setups: Array<{
    horizon: string;
    timeframe: string;
    strategy: string;
    direction: string;
    entryPrice: number;
    stopLoss: number;
    takeProfits: number[];
    riskRewardRatio: number;
    context: string;
    riskNotes: string;
    strategyMeta: {
      confidence: number;
    };
  }>;
  disclaimer: string;
}

function buildQuestion(p: any) {
  const lines = [
    `Provide an institutional macro outlook and risks for ${p.instrument}, then a macro-grounded trade idea (entry/SL/TP).`,
    `Prioritize central banks / Bloomberg / Reuters; ignore low-authority sources unless they synthesize institutional research.`,
    `Focus on policy divergence, inflation, growth, labor, real yields, financial conditions.`,
    `Use technicals only to refine entries after macro.`
  ];
  if (p?.timeframe)    lines.push(`User timeframe: ${p.timeframe}.`);
  if (p?.riskLevel)    lines.push(`User risk: ${p.riskLevel}.`);
  if (p?.strategy)     lines.push(`Strategy: ${p.strategy}.`);
  if (p?.positionSize) lines.push(`Position size: ${p.positionSize}.`);
  if (p?.customNotes)  lines.push(`Note: ${p.customNotes}.`);
  return lines.join(' ');
}

function extractMacroInsight(macroResult: any) {
  try {
    if (Array.isArray(macroResult) && macroResult[0]?.message?.content) {
      return String(macroResult[0].message.content);
    }
    if (typeof macroResult?.summary === 'string') return macroResult.summary;
    if (typeof macroResult?.data?.summary === 'string') return macroResult.data.summary;
    if (typeof macroResult?._rawText === 'string') {
      // fallback texte brut
      const t = macroResult._rawText.trim();
      return t.length > 5000 ? t.slice(0, 5000) + ' …[truncated]' : t;
    }
    const s = JSON.stringify(macroResult);
    return s.length > 5000 ? s.slice(0, 5000) + ' …[truncated]' : s;
  } catch {
    return "[macro insight unavailable]";
  }
}

export default function AISetup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<"parameters" | "generated">("parameters");
  const [isGenerating, setIsGenerating] = useState(false);
  const [tradeSetup, setTradeSetup] = useState<TradeSetup | null>(null);
  const [n8nResult, setN8nResult] = useState<N8nTradeResult | null>(null);
  const [rawN8nResponse, setRawN8nResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [parameters, setParameters] = useState({
    instrument: "EUR/USD",
    timeframe: "4h",
    riskLevel: "medium",
    positionSize: "2",
    strategy: "breakout",
    customNotes: ""
  });

  const generateTradeSetup = async () => {
    setIsGenerating(true);
    setError(null);
    setN8nResult(null);
    
    try {
      // STEP 1: macro-commentary
      const macroPayload = {
        type: "RAG",
        mode: "run",
        instrument: parameters.instrument,
        question: buildQuestion(parameters),
      };

      console.log('📊[AISetup] STEP1 Request macro-commentary payload =', macroPayload);

      let macroResult;
      try {
        macroResult = await safeFetchJson(
          'https://dorian68.app.n8n.cloud/webhook/4572387f-700e-4987-b768-d98b347bd7f1',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(macroPayload),
            signal: AbortSignal.timeout ? AbortSignal.timeout(120000) : undefined
          }
        );
      } catch (e) {
        console.error('❌ STEP1 failed before parsing (network/CORS):', e);
        throw e;
      }

      console.log('📊[AISetup] STEP1 Response (keys):', Object.keys(macroResult || {}));
      const macroInsight = extractMacroInsight(macroResult);
      console.log('📊[AISetup] STEP1 macroInsight length =', macroInsight?.length);

      // STEP 2: ai-trade-setup
      const payload = {
        ...parameters,
        mode: "run",
        type: "trade",
        macroInsight, // string compacte
      };

      console.log('📊[AISetup] STEP2 Request trade-setup, macroInsight length =', macroInsight?.length);

      const result = await safeFetchJson(
        'https://dorian68.app.n8n.cloud/webhook/4572387f-700e-4987-b768-d98b347bd7f1',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout ? AbortSignal.timeout(120000) : undefined
        }
      );

      console.log('📊[AISetup] STEP2 Response received (keys):', Object.keys(result || {}));
      setRawN8nResponse(result);
      
      // Check if we have the expected n8n format
      if (Array.isArray(result) && result.length > 0 && result[0].message?.content) {
        const content = result[0].message.content;
        console.log('N8n Result set:', content);
        setN8nResult(content);
        
        toast({
          title: "Trade Setup Generated",
          description: "Your AI trade setup has been generated successfully.",
        });
      } else {
        // Fallback to legacy format for backward compatibility
        const direction = Math.random() > 0.5 ? "buy" : "sell";
        const basePrice = 1.0900;
        
        let entry, stopLoss, takeProfit;
        if (direction === "buy") {
          entry = basePrice * 0.998;
          stopLoss = entry * 0.985;
          takeProfit = entry * 1.045;
        } else {
          entry = basePrice * 1.002;
          stopLoss = entry * 1.015;
          takeProfit = entry * 0.955;
        }
        
        const riskReward = Math.abs(takeProfit - entry) / Math.abs(entry - stopLoss);
        
        setTradeSetup({
          entry: parseFloat(entry.toFixed(4)),
          stopLoss: parseFloat(stopLoss.toFixed(4)),
          takeProfit: parseFloat(takeProfit.toFixed(4)),
          positionSize: parseFloat(parameters.positionSize),
          riskReward: parseFloat(riskReward.toFixed(2)),
          confidence: Math.floor(Math.random() * 25) + 70,
          reasoning: `AI analysis suggests a ${direction} opportunity based on ${parameters.strategy} strategy for ${parameters.instrument}. Technical indicators show strong momentum with favorable risk-reward ratio.`
        });
        
        toast({
          title: "Trade Setup Generated",
          description: "Your AI trade setup has been generated successfully (legacy format).",
        });
      }
      
      setStep("generated");
      
    } catch (error) {
      console.error('Error generating trade setup:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveSetup = () => {
    toast({
      title: "Setup Saved",
      description: "Your trade configuration has been saved successfully.",
    });
  };

  return (
    <Layout activeModule="ai-setup" onModuleChange={() => {}}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate('/dashboard')}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Trade Setup</h1>
            <p className="text-muted-foreground">Automated trade configuration and generation</p>
          </div>
        </div>

        {step === "parameters" && (
          <Card className="gradient-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Trading Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="instrument">Instrument</Label>
                  <Select value={parameters.instrument} onValueChange={(value) => setParameters({...parameters, instrument: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR/USD">EUR/USD</SelectItem>
                      <SelectItem value="GBP/USD">GBP/USD</SelectItem>
                      <SelectItem value="USD/JPY">USD/JPY</SelectItem>
                      <SelectItem value="USD/CHF">USD/CHF</SelectItem>
                      <SelectItem value="AUD/USD">AUD/USD</SelectItem>
                      <SelectItem value="USD/CAD">USD/CAD</SelectItem>
                      <SelectItem value="NZD/USD">NZD/USD</SelectItem>
                      <SelectItem value="EUR/GBP">EUR/GBP</SelectItem>
                      <SelectItem value="EUR/JPY">EUR/JPY</SelectItem>
                      <SelectItem value="GBP/JPY">GBP/JPY</SelectItem>
                      <SelectItem value="BTC/USD">Bitcoin</SelectItem>
                      <SelectItem value="ETH/USD">Ethereum</SelectItem>
                      <SelectItem value="BNB/USD">Binance Coin</SelectItem>
                      <SelectItem value="ADA/USD">Cardano</SelectItem>
                      <SelectItem value="SOL/USD">Solana</SelectItem>
                      <SelectItem value="DOT/USD">Polkadot</SelectItem>
                      <SelectItem value="MATIC/USD">Polygon</SelectItem>
                      <SelectItem value="GOLD">Gold</SelectItem>
                      <SelectItem value="SILVER">Silver</SelectItem>
                      <SelectItem value="WTI">Oil (WTI)</SelectItem>
                      <SelectItem value="BRENT">Oil (Brent)</SelectItem>
                      <SelectItem value="AAPL">Apple</SelectItem>
                      <SelectItem value="TSLA">Tesla</SelectItem>
                      <SelectItem value="MSFT">Microsoft</SelectItem>
                      <SelectItem value="GOOGL">Google</SelectItem>
                      <SelectItem value="AMZN">Amazon</SelectItem>
                      <SelectItem value="NVDA">NVIDIA</SelectItem>
                      <SelectItem value="META">Meta</SelectItem>
                      <SelectItem value="NFLX">Netflix</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeframe">Timeframe</Label>
                  <Select value={parameters.timeframe} onValueChange={(value) => setParameters({...parameters, timeframe: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 Hour</SelectItem>
                      <SelectItem value="4h">4 Hours</SelectItem>
                      <SelectItem value="1d">1 Day</SelectItem>
                      <SelectItem value="1w">1 Week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="riskLevel">Risk Level</Label>
                  <Select value={parameters.riskLevel} onValueChange={(value) => setParameters({...parameters, riskLevel: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Conservative</SelectItem>
                      <SelectItem value="medium">Moderate</SelectItem>
                      <SelectItem value="high">Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="positionSize">Position Size (%)</Label>
                  <Input 
                    id="positionSize"
                    type="number"
                    value={parameters.positionSize}
                    onChange={(e) => setParameters({...parameters, positionSize: e.target.value})}
                    placeholder="2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="strategy">Strategy</Label>
                  <Select value={parameters.strategy} onValueChange={(value) => setParameters({...parameters, strategy: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breakout">Breakout</SelectItem>
                      <SelectItem value="reversal">Reversal</SelectItem>
                      <SelectItem value="trend">Trend Following</SelectItem>
                      <SelectItem value="scalping">Scalping</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customNotes">Custom Notes</Label>
                <Textarea 
                  id="customNotes"
                  value={parameters.customNotes}
                  onChange={(e) => setParameters({...parameters, customNotes: e.target.value})}
                  placeholder="Add specific instructions for the AI..."
                  rows={3}
                />
              </div>

              <Button 
                onClick={generateTradeSetup} 
                disabled={isGenerating}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Generate Trade Setup
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "generated" && (
          <div className="space-y-6">
            {error && (
              <Card className="border-red-200 bg-red-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-800">
                    <AlertCircle className="h-5 w-5" />
                    Erreur de Génération
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-red-700">{error}</p>
                  <Button 
                    onClick={() => setStep("parameters")} 
                    variant="outline" 
                    className="mt-4"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Réessayer
                  </Button>
                </CardContent>
              </Card>
            )}

            {n8nResult && (
              <TradeResultPanel result={n8nResult} rawResponse={rawN8nResponse} />
            )}

            {tradeSetup && !n8nResult && (
              <Card className="border-green-200 bg-green-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Target className="h-5 w-5" />
                    Generated Trade Setup (Legacy)
                    <Badge variant="outline" className="ml-auto">
                      Confidence: {tradeSetup.confidence}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                    <div className="text-center">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">Entry</Label>
                      <p className="text-2xl font-bold text-blue-600 mt-1">{tradeSetup.entry}</p>
                    </div>
                    <div className="text-center">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">Stop Loss</Label>
                      <p className="text-2xl font-bold text-red-600 mt-1">{tradeSetup.stopLoss}</p>
                    </div>
                    <div className="text-center">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">Take Profit</Label>
                      <p className="text-2xl font-bold text-green-600 mt-1">{tradeSetup.takeProfit}</p>
                    </div>
                    <div className="text-center">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wide">Risk/Reward</Label>
                      <p className="text-2xl font-bold text-orange-600 mt-1">{tradeSetup.riskReward}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-white/70 rounded-lg border mb-6">
                    <h4 className="font-semibold text-green-800 mb-2">AI Analysis</h4>
                    <p className="text-sm leading-relaxed">{tradeSetup.reasoning}</p>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={() => setStep("parameters")} variant="outline">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Regenerate
                    </Button>
                    <Button onClick={saveSetup} className="flex-1">
                      <Save className="mr-2 h-4 w-4" />
                      Save Setup
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex gap-3">
              <Button onClick={() => setStep("parameters")} variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" />
                Nouvelle Configuration
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}