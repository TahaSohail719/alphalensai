import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Zap, Target, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CandlestickChart } from "./CandlestickChart";

const assets = ["EUR/USD", "GBP/USD", "USD/JPY", "GOLD", "SILVER", "CRUDE", "BTC", "ETH"];
const timeframes = ["1h", "4h", "1d"];

interface TradeIdea {
  instrument: string;
  direction: "buy" | "sell";
  reasoning: string;
  confidence: number;
  risk_reward: number;
}

interface TradeLevels {
  entry: number;
  stopLoss: number;
  takeProfit: number;
  riskReward: number;
  taSummary: string;
  direction: "buy" | "sell";
}

export function TradingDashboard() {
  const [selectedAsset, setSelectedAsset] = useState("EUR/USD");
  const [timeframe, setTimeframe] = useState("4h");
  const [isGenerating, setIsGenerating] = useState(false);
  const [tradeIdea, setTradeIdea] = useState<TradeIdea | null>(null);
  const [tradeLevels, setTradeLevels] = useState<TradeLevels | null>(null);
  const [showLevels, setShowLevels] = useState(false);
  const [isGeneratingLevels, setIsGeneratingLevels] = useState(false);

  const generateTradeIdea = () => {
    setIsGenerating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const directions: ("buy" | "sell")[] = ["buy", "sell"];
      const direction = directions[Math.floor(Math.random() * directions.length)];
      
      const mockIdea: TradeIdea = {
        instrument: selectedAsset,
        direction,
        reasoning: `AI analysis suggests a ${direction} opportunity based on technical indicators and market sentiment for ${selectedAsset}.`,
        confidence: Math.floor(Math.random() * 20) + 70, // 70-90%
        risk_reward: parseFloat((Math.random() * 2 + 1.5).toFixed(1)) // 1.5-3.5
      };
      
      setTradeIdea(mockIdea);
      setIsGenerating(false);
    }, 2000);
  };

  const generateTechnicalLevels = () => {
    setIsGeneratingLevels(true);
    
    // Simulate API call delay
    setTimeout(() => {
      if (!tradeIdea) return;
      
      const basePrice = 1.0900; // Mock current price
      const direction = tradeIdea.direction;
      
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
      
      const levels: TradeLevels = {
        entry: parseFloat(entry.toFixed(4)),
        stopLoss: parseFloat(stopLoss.toFixed(4)),
        takeProfit: parseFloat(takeProfit.toFixed(4)),
        riskReward: parseFloat(riskReward.toFixed(2)),
        taSummary: "Technical analysis shows strong momentum with key level confirmation.",
        direction
      };
      
      setTradeLevels(levels);
      setShowLevels(true);
      setIsGeneratingLevels(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header with Market Selection */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Trading Dashboard</h1>
          <p className="text-muted-foreground">AI-powered trade analysis and execution</p>
        </div>
        
        {/* Compact Market Selection */}
        <div className="flex gap-3">
          <Select value={selectedAsset} onValueChange={setSelectedAsset}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Asset" />
            </SelectTrigger>
            <SelectContent>
              {assets.map((asset) => (
                <SelectItem key={asset} value={asset}>
                  {asset}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">1H</SelectItem>
              <SelectItem value="4h">4H</SelectItem>
              <SelectItem value="1d">1D</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Layout - Chart Focused */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Trade Setup - Prominent */}
        <div className="lg:order-2">
          <Card className="border-primary shadow-lg">
            <CardHeader className="bg-primary/5">
              <CardTitle className="text-xl flex items-center gap-2">
                <Zap className="h-6 w-6 text-primary" />
                AI Trade Setup
              </CardTitle>
              <p className="text-sm text-muted-foreground">Generate intelligent trade ideas</p>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <Button 
                onClick={generateTradeIdea} 
                disabled={isGenerating}
                className="w-full h-12 text-base"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Trade Idea...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-5 w-5" />
                    Generate Trade Idea
                  </>
                )}
              </Button>
              
              {tradeIdea && (
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-lg">{tradeIdea.instrument}</span>
                    <Badge 
                      variant={tradeIdea.direction === "buy" ? "default" : "destructive"}
                      className="text-sm px-3 py-1"
                    >
                      {tradeIdea.direction.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {tradeIdea.reasoning}
                  </p>
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span className="text-green-600">Confidence: {tradeIdea.confidence}%</span>
                    <span className="text-blue-600">R:R: {tradeIdea.risk_reward}</span>
                  </div>
                </div>
              )}
              
              {tradeIdea && (
                <Button 
                  onClick={generateTechnicalLevels}
                  disabled={isGeneratingLevels}
                  variant="outline"
                  className="w-full h-11"
                >
                  {isGeneratingLevels ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Levels...
                    </>
                  ) : (
                    <>
                      <Target className="mr-2 h-4 w-4" />
                      Generate Technical Levels
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Live Chart - Main Focus */}
        <div className="lg:col-span-2 lg:order-1">
          <Card className="h-[700px]">
            <CardHeader>
              <CardTitle className="text-xl">Live Chart - {selectedAsset}</CardTitle>
            </CardHeader>
            <CardContent className="h-full p-0">
              <CandlestickChart 
                asset={selectedAsset} 
                tradeLevels={showLevels ? tradeLevels : undefined}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Technical Analysis Section */}
      {showLevels && tradeLevels && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Target className="h-5 w-5" />
              Technical Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Entry</Label>
                <p className="text-2xl font-bold text-blue-600 mt-1">{tradeLevels.entry}</p>
              </div>
              <div className="text-center">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Stop Loss</Label>
                <p className="text-2xl font-bold text-red-600 mt-1">{tradeLevels.stopLoss}</p>
              </div>
              <div className="text-center">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Take Profit</Label>
                <p className="text-2xl font-bold text-green-600 mt-1">{tradeLevels.takeProfit}</p>
              </div>
              <div className="text-center">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">Risk/Reward</Label>
                <p className="text-2xl font-bold text-orange-600 mt-1">{tradeLevels.riskReward}</p>
              </div>
            </div>
            <div className="mt-6 p-4 bg-white/70 rounded-lg border">
              <h4 className="font-semibold text-green-800 mb-2">Analysis Summary</h4>
              <p className="text-sm leading-relaxed">{tradeLevels.taSummary}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}