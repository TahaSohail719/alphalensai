import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Menu,
  X,
  ChevronRight,
  Activity,
  Zap
} from "lucide-react";
import { BubbleSystem } from "./BubbleSystem";

interface LayoutProps {
  children: React.ReactNode;
  activeModule: string;
  onModuleChange: (module: string) => void;
}


export function Layout({ children, activeModule, onModuleChange }: LayoutProps) {
  const [selectedAsset, setSelectedAsset] = useState("EUR/USD");
  const [timeframe, setTimeframe] = useState("4h");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20">
      {/* Mobile-First Responsive Header */}
      <header className="h-16 border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="h-full px-4 sm:px-6">
          <div className="flex items-center justify-between h-full">
            {/* Logo - Mobile optimized */}
            <button
              onClick={() => onModuleChange("welcome")}
              className="flex items-center gap-2 hover:opacity-90 transition-all duration-200 group min-w-0"
            >
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200 shrink-0">
                <TrendingUp className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="hidden xs:block min-w-0">
                <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent truncate">
                  TradeMind
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">AI Trading Intelligence</p>
              </div>
            </button>

            {/* Mobile Navigation + Status */}
            <div className="flex items-center gap-2">
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden h-10 w-10 p-0"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>

              {/* Status Indicator - Always visible but adapted */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground bg-card/50 px-2 py-1 rounded-full border border-border/50">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span className="hidden sm:inline">Live Markets</span>
                <span className="sm:hidden">Live</span>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="absolute top-full left-0 right-0 bg-card/95 backdrop-blur-xl border-b border-border/50 shadow-xl md:hidden">
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onModuleChange("trading");
                      setIsMobileMenuOpen(false);
                    }}
                    className="justify-start"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Trading
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onModuleChange("ai-setup");
                      setIsMobileMenuOpen(false);
                    }}
                    className="justify-start"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    AI Setup
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border/30">
                  Current Asset: {selectedAsset} • {timeframe}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content - Mobile responsive */}
      <main className="flex-1 overflow-auto">
        <div className="min-h-[calc(100vh-4rem)]">
          {/* Mobile-first container with proper spacing */}
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-6">
            {children}
          </div>
        </div>
      </main>

      {/* Global Floating Bubble System - Mobile adapted */}
      <BubbleSystem 
        instrument={selectedAsset} 
        timeframe={timeframe} 
        onTradeSetupClick={() => onModuleChange("trading")}
      />
    </div>
  );
}