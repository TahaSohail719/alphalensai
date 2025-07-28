import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  RefreshCw,
  Eye,
  AlertCircle,
  Target,
  Shield,
  DollarSign,
  Clock,
  Save,
  Share2,
  ChevronLeft,
  ChevronRight,
  Settings,
  Brain,
  FileText,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CandlestickChart } from "./CandlestickChart";

const assets = [
  { symbol: "EUR/USD", name: "Euro / US Dollar", type: "FX" },
  { symbol: "GBP/USD", name: "British Pound / US Dollar", type: "FX" },
  { symbol: "USD/JPY", name: "US Dollar / Japanese Yen", type: "FX" },
  { symbol: "GOLD", name: "Gold Spot", type: "Commodity" },
  { symbol: "SILVER", name: "Silver Spot", type: "Commodity" },
  { symbol: "CRUDE", name: "Crude Oil WTI", type: "Commodity" },
  { symbol: "BTC", name: "Bitcoin", type: "Crypto" },
  { symbol: "ETH", name: "Ethereum", type: "Crypto" },
];

const riskLevels = [
  { value: "low", label: "Low Risk (1-2%)", color: "success" },
  { value: "medium", label: "Medium Risk (2-3%)", color: "warning" },
  { value: "high", label: "High Risk (3-5%)", color: "danger" },
];

const timeframes = [
  { value: "intraday", label: "Intraday (1-4 hours)" },
  { value: "short", label: "Short-term (1-3 days)" },
  { value: "medium", label: "Medium-term (1-2 weeks)" },
  { value: "long", label: "Long-term (1+ months)" },
];

const mockTechnicalData = {
  "EUR/USD": {
    trend: "Bearish",
    momentum: 35,
    strength: 68,
    volatility: 42,
    signals: [
      { name: "RSI", value: 34, status: "oversold", color: "success" },
      { name: "MACD", value: -0.0015, status: "bearish", color: "danger" },
      { name: "SMA 50", value: 1.0892, status: "below", color: "danger" },
      { name: "SMA 200", value: 1.0945, status: "below", color: "danger" },
    ],
    keyLevels: {
      resistance: ["1.0950", "1.0985", "1.1020"],
      support: ["1.0850", "1.0810", "1.0775"]
    },
    lastUpdate: "2 minutes ago"
  },
  "BTC": {
    trend: "Bullish",
    momentum: 78,
    strength: 85,
    volatility: 65,
    signals: [
      { name: "RSI", value: 68, status: "bullish", color: "success" },
      { name: "MACD", value: 1250.5, status: "bullish", color: "success" },
      { name: "SMA 50", value: 41200, status: "above", color: "success" },
      { name: "SMA 200", value: 39800, status: "above", color: "success" },
    ],
    keyLevels: {
      resistance: ["43500", "45000", "47500"],
      support: ["41000", "39500", "38000"]
    },
    lastUpdate: "1 minute ago"
  }
};

const mockTradeIdeas = {
  "EUR/USD": {
    instrument: "EUR/USD",
    direction: "Short",
    setup: "Break below key support level with confirmation",
    entry: "1.0845",
    stopLoss: "1.0895",
    takeProfit: "1.0775",
    riskReward: "1:1.4",
    confidence: 78,
    timeframe: "Short-term",
    reasoning: "Technical breakdown below 1.0850 support, bearish momentum confirmed by RSI divergence and MACD crossover.",
    keyFactors: ["Technical breakdown", "RSI divergence", "ECB dovish policy", "USD strength"]
  },
  "BTC": {
    instrument: "Bitcoin",
    direction: "Long", 
    setup: "Breakout above resistance with volume confirmation",
    entry: "$42,500",
    stopLoss: "$40,000",
    takeProfit: "$48,500",
    riskReward: "1:2.4",
    confidence: 85,
    timeframe: "Medium-term",
    reasoning: "BTC breaking above key resistance with strong volume. Institutional adoption and risk-on sentiment improving.",
    keyFactors: ["Volume breakout", "Institutional flows", "ETF demand", "Risk-on sentiment"]
  }
};

interface TechnicalIndicator {
  name: string;
  value: number | string;
  status: string;
  color: "success" | "danger" | "warning";
}

interface AssetTechnical {
  trend: string;
  momentum: number;
  strength: number;
  volatility: number;
  signals: TechnicalIndicator[];
  keyLevels: {
    resistance: string[];
    support: string[];
  };
  lastUpdate: string;
}

export function TradingDashboard() {
  const [selectedAsset, setSelectedAsset] = useState("EUR/USD");
  const [isLoading, setIsLoading] = useState(false);
  const [riskLevel, setRiskLevel] = useState("medium");
  const [timeframe, setTimeframe] = useState("short");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentIdea, setCurrentIdea] = useState<any>(null);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  
  const currentData = mockTechnicalData[selectedAsset as keyof typeof mockTechnicalData] || mockTechnicalData["EUR/USD"];

  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const generateTradeIdea = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const idea = mockTradeIdeas[selectedAsset as keyof typeof mockTradeIdeas] || mockTradeIdeas["EUR/USD"];
      setCurrentIdea(idea);
      setIsGenerating(false);
    }, 1500);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend.toLowerCase()) {
      case "bullish":
        return <TrendingUp className="h-4 w-4 text-success" />;
      case "bearish":
        return <TrendingDown className="h-4 w-4 text-danger" />;
      default:
        return <Minus className="h-4 w-4 text-warning" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend.toLowerCase()) {
      case "bullish":
        return "text-success";
      case "bearish":
        return "text-danger";
      default:
        return "text-warning";
    }
  };

  const getDirectionColor = (direction: string) => {
    return direction.toLowerCase() === "long" ? "text-success" : "text-danger";
  };

  const getDirectionIcon = (direction: string) => {
    return direction.toLowerCase() === "long" ? 
      <TrendingUp className="h-4 w-4" /> : 
      <TrendingDown className="h-4 w-4" />;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border-light bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
              className="lg:hidden"
            >
              {leftSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">AI Trading Copilot</h1>
              <p className="text-sm text-muted-foreground">Real-time analysis & AI-powered recommendations</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              <Brain className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={refreshData}
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Sidebar - Inputs & Context */}
        <div className={cn(
          "border-r border-border-light bg-card/50 transition-all duration-300 overflow-y-auto",
          leftSidebarOpen ? "w-80" : "w-0 overflow-hidden lg:w-16"
        )}>
          <div className="p-4 space-y-4">
            {/* Collapse button for desktop */}
            <div className="hidden lg:flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
              >
                {leftSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>

            {leftSidebarOpen && (
              <>
                {/* Asset Selection */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Market Selection
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {assets.map((asset) => (
                      <button
                        key={asset.symbol}
                        onClick={() => setSelectedAsset(asset.symbol)}
                        className={cn(
                          "p-2 rounded-lg border transition-smooth text-left text-xs",
                          selectedAsset === asset.symbol
                            ? "bg-primary/10 border-primary/20 text-primary"
                            : "bg-background border-border-light hover:bg-accent/50"
                        )}
                      >
                        <div className="font-medium">{asset.symbol}</div>
                        <div className="text-muted-foreground">{asset.type}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <Separator className="bg-border-light" />

                {/* Trading Preferences */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Settings className="h-4 w-4 text-primary" />
                    Preferences
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">
                        Risk Level
                      </label>
                      <Select value={riskLevel} onValueChange={setRiskLevel}>
                        <SelectTrigger className="h-8 text-xs bg-background/50 border-border-light">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {riskLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              <div className="flex items-center gap-2">
                                <div className={cn(
                                  "w-2 h-2 rounded-full",
                                  level.color === "success" ? "bg-success" :
                                  level.color === "warning" ? "bg-warning" : "bg-danger"
                                )} />
                                <span className="text-xs">{level.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-foreground mb-1 block">
                        Time Horizon
                      </label>
                      <Select value={timeframe} onValueChange={setTimeframe}>
                        <SelectTrigger className="h-8 text-xs bg-background/50 border-border-light">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeframes.map((tf) => (
                            <SelectItem key={tf.value} value={tf.value}>
                              <span className="text-xs">{tf.label}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator className="bg-border-light" />

                {/* Market Overview */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Current Trend</h3>
                  <div className="bg-accent/30 rounded-lg p-3 border border-border-light">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">Trend</span>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(currentData.trend)}
                        <span className={cn("text-xs font-medium", getTrendColor(currentData.trend))}>
                          {currentData.trend}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Strength</span>
                        <span className="text-xs font-medium">{currentData.strength}%</span>
                      </div>
                      <Progress value={currentData.strength} className="h-1" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {!leftSidebarOpen && (
              <div className="hidden lg:flex flex-col items-center gap-4">
                <Button
                  variant={selectedAsset === "EUR/USD" ? "default" : "ghost"}
                  size="sm"
                  className="w-12 h-12 p-0"
                  onClick={() => setSelectedAsset("EUR/USD")}
                >
                  EUR
                </Button>
                <Button
                  variant={selectedAsset === "BTC" ? "default" : "ghost"}
                  size="sm"
                  className="w-12 h-12 p-0"
                  onClick={() => setSelectedAsset("BTC")}
                >
                  BTC
                </Button>
                <Button
                  variant={selectedAsset === "GOLD" ? "default" : "ghost"}
                  size="sm"
                  className="w-12 h-12 p-0"
                  onClick={() => setSelectedAsset("GOLD")}
                >
                  GLD
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Center Area - Chart & Analysis */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Live Chart */}
            <Card className="gradient-card border-border-light shadow-medium">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Live Chart - {selectedAsset}</CardTitle>
              </CardHeader>
              <CardContent>
                <CandlestickChart 
                  asset={selectedAsset} 
                  height={400}
                />
              </CardContent>
            </Card>

            {/* Technical Analysis Grid */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Key Levels */}
              <Card className="gradient-card border-border-light shadow-medium">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Key Levels</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h4 className="text-xs font-medium text-danger mb-2">Resistance</h4>
                    <div className="space-y-1">
                      {currentData.keyLevels.resistance.map((level, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-danger/5 border border-danger/20 rounded text-xs">
                          <span>R{index + 1}</span>
                          <span className="font-mono text-danger">{level}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-medium text-success mb-2">Support</h4>
                    <div className="space-y-1">
                      {currentData.keyLevels.support.map((level, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-success/5 border border-success/20 rounded text-xs">
                          <span>S{index + 1}</span>
                          <span className="font-mono text-success">{level}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Technical Signals */}
              <Card className="gradient-card border-border-light shadow-medium">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Technical Signals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {currentData.signals.map((signal, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-accent/30 rounded border border-border-light">
                      <div>
                        <div className="font-medium text-xs">{signal.name}</div>
                        <div className="text-xs text-muted-foreground">{signal.status}</div>
                      </div>
                      <div className={cn(
                        "font-mono text-xs",
                        signal.color === "success" ? "text-success" :
                        signal.color === "danger" ? "text-danger" : "text-warning"
                      )}>
                        {typeof signal.value === 'number' ? signal.value.toFixed(4) : signal.value}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Market Momentum */}
              <Card className="gradient-card border-border-light shadow-medium">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Market Momentum</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Momentum</span>
                      <span>{currentData.momentum}%</span>
                    </div>
                    <Progress value={currentData.momentum} className="h-1" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Strength</span>
                      <span>{currentData.strength}%</span>
                    </div>
                    <Progress value={currentData.strength} className="h-1" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Volatility</span>
                      <span>{currentData.volatility}%</span>
                    </div>
                    <Progress value={currentData.volatility} className="h-1" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Trade Result */}
            {currentIdea && (
              <Card className="gradient-card border-border-light shadow-strong">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        currentIdea.direction.toLowerCase() === "long" 
                          ? "bg-success/10 text-success" 
                          : "bg-danger/10 text-danger"
                      )}>
                        {getDirectionIcon(currentIdea.direction)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold">{currentIdea.instrument}</span>
                          <Badge variant="secondary" className={cn(
                            currentIdea.direction.toLowerCase() === "long"
                              ? "bg-success/10 text-success border-success/20"
                              : "bg-danger/10 text-danger border-danger/20"
                          )}>
                            {currentIdea.direction}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{currentIdea.setup}</p>
                      </div>
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">Confidence:</span>
                      <Badge variant="outline" className="border-primary/20 text-primary text-xs">
                        {currentIdea.confidence}%
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-accent/30 rounded-lg p-3 border border-border-light text-center">
                      <div className="text-xs text-muted-foreground mb-1">Entry</div>
                      <div className="font-mono text-sm font-bold">{currentIdea.entry}</div>
                    </div>
                    <div className="bg-accent/30 rounded-lg p-3 border border-border-light text-center">
                      <div className="text-xs text-muted-foreground mb-1">Stop</div>
                      <div className="font-mono text-sm font-bold text-danger">{currentIdea.stopLoss}</div>
                    </div>
                    <div className="bg-accent/30 rounded-lg p-3 border border-border-light text-center">
                      <div className="text-xs text-muted-foreground mb-1">Target</div>
                      <div className="font-mono text-sm font-bold text-success">{currentIdea.takeProfit}</div>
                    </div>
                    <div className="bg-accent/30 rounded-lg p-3 border border-border-light text-center">
                      <div className="text-xs text-muted-foreground mb-1">R:R</div>
                      <div className="font-mono text-sm font-bold text-warning">{currentIdea.riskReward}</div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">{currentIdea.reasoning}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-1">
                    {currentIdea.keyFactors.map((factor: string, index: number) => (
                      <div key={index} className="bg-primary/5 border border-primary/20 rounded p-1">
                        <span className="text-xs text-primary font-medium">{factor}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Right Panel - AI Controls */}
        <div className={cn(
          "border-l border-border-light bg-card/50 transition-all duration-300 overflow-y-auto",
          rightPanelOpen ? "w-80" : "w-0 overflow-hidden lg:w-16"
        )}>
          <div className="p-4 space-y-4">
            {/* Collapse button */}
            <div className="flex justify-start">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setRightPanelOpen(!rightPanelOpen)}
              >
                {rightPanelOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
            </div>

            {rightPanelOpen && (
              <>
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" />
                    AI Copilot Actions
                  </h3>
                  
                  <div className="space-y-2">
                    <Button 
                      onClick={generateTradeIdea}
                      disabled={isGenerating}
                      className="w-full justify-start"
                      size="sm"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Target className="h-4 w-4 mr-2" />
                          Generate Trade Idea
                        </>
                      )}
                    </Button>

                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Technical Analysis
                    </Button>

                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Macro Outlook
                    </Button>

                    <Button variant="outline" className="w-full justify-start" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>
                  </div>
                </div>

                <Separator className="bg-border-light" />

                {currentIdea && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">Trade Actions</h3>
                    <div className="space-y-2">
                      <Button variant="default" className="w-full justify-start" size="sm">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Execute Trade
                      </Button>
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Add to Watchlist
                      </Button>
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        Save Analysis
                      </Button>
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share Idea
                      </Button>
                    </div>
                  </div>
                )}

                <Separator className="bg-border-light" />

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">Quick Stats</h3>
                  <div className="bg-accent/30 rounded-lg p-3 border border-border-light">
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Update</span>
                        <span>{currentData.lastUpdate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Asset</span>
                        <span className="font-medium">{selectedAsset}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status</span>
                        <span className="text-success">Live</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {!rightPanelOpen && (
              <div className="hidden lg:flex flex-col items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-12 h-12 p-0"
                  onClick={generateTradeIdea}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Target className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="ghost" size="sm" className="w-12 h-12 p-0">
                  <BarChart3 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="w-12 h-12 p-0">
                  <FileText className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}