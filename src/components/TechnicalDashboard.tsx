import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3,
  ExternalLink,
  RefreshCw,
  Signal,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TechnicalSignal {
  name: string;
  value: string;
  signal: "BUY" | "SELL" | "NEUTRAL";
  strength: "STRONG" | "WEAK";
}

interface TechnicalIndicator {
  name: string;
  value: number;
  signal: "BUY" | "SELL" | "NEUTRAL";
  timestamp?: string;
}

interface TwelveDataResponse {
  values?: Array<{
    datetime: string;
    rsi?: string;
    atr?: string;
    adx?: string;
  }>;
  status?: string;
}

interface AssetInfo {
  symbol: string;
  display: string;
  market: "FX" | "CRYPTO";
  tradingViewSymbol: string;
}

interface TechnicalDashboardProps {
  selectedAsset: AssetInfo;
}

export function TechnicalDashboard({ selectedAsset }: TechnicalDashboardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [indicators, setIndicators] = useState<TechnicalIndicator[]>([]);
  const [signals, setSignals] = useState<TechnicalSignal[]>([]);
  const [summary, setSummary] = useState<"BUY" | "SELL" | "NEUTRAL">("NEUTRAL");
  const [error, setError] = useState<string | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState(selectedAsset.symbol);
  const [selectedInterval, setSelectedInterval] = useState("30min");

  // Available symbols for Twelve Data
  const availableSymbols = [
    { value: "EUR/USD", label: "EUR/USD" },
    { value: "GBP/USD", label: "GBP/USD" },
    { value: "USD/JPY", label: "USD/JPY" },
    { value: "AUD/USD", label: "AUD/USD" },
    { value: "USD/CAD", label: "USD/CAD" },
    { value: "USD/CHF", label: "USD/CHF" },
    { value: "BTC/USD", label: "BTC/USD" },
    { value: "ETH/USD", label: "ETH/USD" },
  ];

  // Available intervals
  const availableIntervals = [
    { value: "15min", label: "15 Minutes" },
    { value: "30min", label: "30 Minutes" },
    { value: "1h", label: "1 Hour" },
    { value: "4h", label: "4 Hours" },
    { value: "1day", label: "Daily" },
  ];

  // Twelve Data API configuration
  const TWELVE_DATA_API_KEY = "e40fcead02054731aef55d2dfe01cf47";
  const TWELVE_DATA_BASE_URL = "https://api.twelvedata.com";

  const fetchIndicatorData = async (indicator: string, symbol: string, interval: string): Promise<TwelveDataResponse> => {
    const url = `${TWELVE_DATA_BASE_URL}/${indicator}?symbol=${symbol}&interval=${interval}&apikey=${TWELVE_DATA_API_KEY}&format=JSON`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${indicator}: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${indicator}:`, error);
      throw error;
    }
  };

  const fetchTechnicalData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching technical data from Twelve Data for ${selectedSymbol} (${selectedInterval})...`);
      
      // Fetch multiple indicators in parallel from Twelve Data API
      const [rsiData, atrData, adxData] = await Promise.all([
        fetchIndicatorData("rsi", selectedSymbol, selectedInterval),
        fetchIndicatorData("atr", selectedSymbol, selectedInterval), 
        fetchIndicatorData("adx", selectedSymbol, selectedInterval)
      ]);

      // Process the responses
      const indicators: TechnicalIndicator[] = [];
      let latestRsi = 0, latestAtr = 0, latestAdx = 0;

      // Process RSI
      if (rsiData.values && rsiData.values.length > 0) {
        const rsiValue = parseFloat(rsiData.values[0].rsi || "0");
        latestRsi = rsiValue;
        indicators.push({
          name: "RSI(14)",
          value: rsiValue,
          signal: getSignalFromRSI(rsiValue),
          timestamp: rsiData.values[0].datetime
        });
      }

      // Process ATR
      if (atrData.values && atrData.values.length > 0) {
        const atrValue = parseFloat(atrData.values[0].atr || "0");
        latestAtr = atrValue;
        indicators.push({
          name: "ATR(14)",
          value: atrValue,
          signal: "NEUTRAL",
          timestamp: atrData.values[0].datetime
        });
      }

      // Process ADX
      if (adxData.values && adxData.values.length > 0) {
        const adxValue = parseFloat(adxData.values[0].adx || "0");
        latestAdx = adxValue;
        indicators.push({
          name: "ADX(14)",
          value: adxValue,
          signal: getSignalFromADX(adxValue),
          timestamp: adxData.values[0].datetime
        });
      }

      if (indicators.length === 0) {
        throw new Error("No data available from Twelve Data API");
      }

      setIndicators(indicators);
      generateSignalsFromIndicators(indicators, latestRsi, latestAdx);
      
      console.log(`Successfully fetched ${indicators.length} indicators from Twelve Data`);
      
    } catch (error) {
      console.error('Error fetching technical data:', error);
      setError("Data unavailable - Please try again later");
      generateMockData();
    } finally {
      setIsLoading(false);
    }
  }, [selectedSymbol, selectedInterval]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTechnicalData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchTechnicalData]);

  const getSignalFromRSI = (rsi: number): "BUY" | "SELL" | "NEUTRAL" => {
    if (rsi < 30) return "BUY";
    if (rsi > 70) return "SELL";
    return "NEUTRAL";
  };

  const getSignalFromADX = (adx: number): "BUY" | "SELL" | "NEUTRAL" => {
    if (adx > 25) return "BUY"; // Strong trend
    return "NEUTRAL";
  };

  const generateSignalsFromIndicators = (indicators: TechnicalIndicator[], rsi: number, adx: number) => {
    const rsiSignal = getSignalFromRSI(rsi);
    const adxSignal = getSignalFromADX(adx);
    
    // Simple trend signal based on RSI momentum
    const trendSignal = rsi > 55 ? "BUY" : rsi < 45 ? "SELL" : "NEUTRAL";
    
    const newSignals: TechnicalSignal[] = [
      {
        name: "Momentum",
        value: trendSignal === "BUY" ? "Bullish" : trendSignal === "SELL" ? "Bearish" : "Neutral",
        signal: trendSignal,
        strength: (rsi > 60 || rsi < 40) ? "STRONG" : "WEAK"
      },
      {
        name: "Oscillators", 
        value: rsiSignal === "BUY" ? "Oversold" : rsiSignal === "SELL" ? "Overbought" : "Neutral",
        signal: rsiSignal,
        strength: (rsi < 20 || rsi > 80) ? "STRONG" : "WEAK"
      },
      {
        name: "Trend Strength",
        value: adx > 25 ? "Strong Trend" : adx > 15 ? "Weak Trend" : "No Trend",
        signal: adxSignal,
        strength: adx > 40 ? "STRONG" : "WEAK"
      }
    ];

    // Calculate overall summary
    const buyCount = newSignals.filter(s => s.signal === "BUY").length;
    const sellCount = newSignals.filter(s => s.signal === "SELL").length;
    
    let overallSignal: "BUY" | "SELL" | "NEUTRAL";
    let overallValue: string;
    
    if (buyCount > sellCount) {
      overallSignal = "BUY";
      overallValue = buyCount >= 2 ? "Strong Buy" : "Buy";
    } else if (sellCount > buyCount) {
      overallSignal = "SELL";
      overallValue = sellCount >= 2 ? "Strong Sell" : "Sell";
    } else {
      overallSignal = "NEUTRAL";
      overallValue = "Neutral";
    }

    newSignals.push({
      name: "Summary",
      value: overallValue,
      signal: overallSignal,
      strength: (buyCount >= 2 || sellCount >= 2) ? "STRONG" : "WEAK"
    });

    setSignals(newSignals);
    setSummary(overallSignal);
  };

  const generateMockData = () => {
    const mockIndicators: TechnicalIndicator[] = [
      { name: "RSI(14)", value: 45.7, signal: "NEUTRAL" },
      { name: "ATR(14)", value: 0.0012, signal: "NEUTRAL" },
      { name: "ADX(14)", value: 28.3, signal: "BUY" }
    ];

    const mockSignals: TechnicalSignal[] = [
      { name: "Momentum", value: "Neutral", signal: "NEUTRAL", strength: "WEAK" },
      { name: "Oscillators", value: "Neutral", signal: "NEUTRAL", strength: "WEAK" },
      { name: "Trend Strength", value: "Strong Trend", signal: "BUY", strength: "WEAK" },
      { name: "Summary", value: "Neutral", signal: "NEUTRAL", strength: "WEAK" }
    ];

    setIndicators(mockIndicators);
    setSignals(mockSignals);
    setSummary("NEUTRAL");
  };

  useEffect(() => {
    fetchTechnicalData();
  }, [fetchTechnicalData]);

  useEffect(() => {
    setSelectedSymbol(selectedAsset.symbol);
  }, [selectedAsset.symbol]);

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case "BUY": return "text-green-600 bg-green-50 border-green-200";
      case "SELL": return "text-red-600 bg-red-50 border-red-200";
      default: return "text-yellow-600 bg-yellow-50 border-yellow-200";
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case "BUY": return <TrendingUp className="h-4 w-4" />;
      case "SELL": return <TrendingDown className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getTradingViewUrl = () => {
    const exchange = selectedAsset.market === "FX" ? "FX" : "BINANCE";
    return `https://www.tradingview.com/symbols/${selectedAsset.tradingViewSymbol}/technicals/?exchange=${exchange}`;
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Asset Symbol</label>
          <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableSymbols.map((symbol) => (
                <SelectItem key={symbol.value} value={symbol.value}>
                  {symbol.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Interval</label>
          <Select value={selectedInterval} onValueChange={setSelectedInterval}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableIntervals.map((interval) => (
                <SelectItem key={interval.value} value={interval.value}>
                  {interval.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button
            variant="outline"
            onClick={fetchTechnicalData}
            disabled={isLoading}
            className="w-full"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Summary Card */}
      <Card className={cn("border-2", getSignalColor(summary))}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getSignalIcon(summary)}
              <div>
                <p className="font-semibold">Overall Signal</p>
                <p className="text-sm opacity-80">{selectedSymbol}</p>
              </div>
            </div>
            <Badge variant="outline" className={getSignalColor(summary)}>
              {summary}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Technical Indicators */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Signal className="h-4 w-4" />
            Technical Indicators
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {indicators.map((indicator, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
              <div className="flex flex-col">
                <span className="font-medium text-sm">{indicator.name}</span>
                {indicator.timestamp && (
                  <span className="text-xs text-muted-foreground">
                    {new Date(indicator.timestamp).toLocaleTimeString()}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono">{indicator.value.toFixed(indicator.name.includes("ATR") ? 4 : 1)}</span>
                <Badge variant="outline" className={getSignalColor(indicator.signal)}>
                  {indicator.signal}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Signals Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Signals Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {signals.map((signal, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <span className="font-medium text-sm">{signal.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{signal.strength}</span>
                <Badge variant="outline" className={getSignalColor(signal.signal)}>
                  {signal.value}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* TradingView Link */}
      <Button
        variant="outline"
        onClick={() => window.open(getTradingViewUrl(), '_blank')}
        className="w-full"
      >
        <ExternalLink className="h-4 w-4 mr-2" />
        View Full Analysis on TradingView
      </Button>
      
      {/* Data Source Info */}
      <div className="text-center text-xs text-muted-foreground">
        Data powered by Twelve Data API • Auto-refreshes every 5 minutes
      </div>
    </div>
  );
}