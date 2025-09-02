import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Brain, FileText, MessageCircle, Sparkles, Zap, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { TradeSetupBubble } from "./TradeSetupBubble";
import { MacroCommentary } from "./MacroCommentary"; 
import { ReportsBubble } from "./ReportsBubble";
import { useNavigate } from "react-router-dom";

interface BubbleSystemProps {
  instrument: string;
  timeframe?: string;
  onTradeSetupClick?: () => void;
  onTradeLevelsUpdate?: (levels: any) => void;
}

export function BubbleSystem({ instrument, timeframe, onTradeSetupClick, onTradeLevelsUpdate }: BubbleSystemProps) {
  const navigate = useNavigate();
  const [activeBubble, setActiveBubble] = useState<"macro" | "reports" | "tradesetup" | null>(null);
  
  // Debug logs
  console.log("BubbleSystem rendering with:", { instrument, timeframe, activeBubble });

  const bubbles = [
    {
      id: "tradesetup",
      icon: Zap,
      label: "AI Trade Setup",
      description: "Generate trade ideas & levels",
      color: "bg-primary hover:bg-primary/90",
      glow: "hover:shadow-primary/25"
    },
    {
      id: "macro",
      icon: Brain,
      label: "Macro Commentary",
      description: "AI market analysis & insights",
      color: "bg-blue-500 hover:bg-blue-600",
      glow: "hover:shadow-blue-500/25"
    },
    {
      id: "reports",
      icon: FileText,
      label: "Reports", 
      description: "Generate trading reports",
      color: "bg-green-500 hover:bg-green-600",
      glow: "hover:shadow-green-500/25"
    }
  ] as const;

  const handleBubbleClick = (bubbleId: "macro" | "reports" | "tradesetup") => {
    console.log("🎯 Bubble clicked:", bubbleId, "Current state:", activeBubble);
    setActiveBubble(bubbleId);
    console.log("🔄 State should change to:", bubbleId);
  };

  const handleCloseBubble = () => {
    console.log("🚪 Closing bubble, was:", activeBubble);
    setActiveBubble(null);
  };

  return (
    <>
      {/* Mobile-optimized Floating Access Bubbles */}
      {!activeBubble && (
        <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-3 safe-bottom safe-right">
          {bubbles.map((bubble) => {
            const IconComponent = bubble.icon;
            
            return (
              <div key={bubble.id} className="relative group">
                <button
                  onClick={() => {
                    console.log("🔥 BUBBLE CLICKED:", bubble.id);
                    handleBubbleClick(bubble.id as "macro" | "reports" | "tradesetup");
                  }}
                  className={cn(
                    "h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer border-0 touch-friendly",
                    "flex items-center justify-center relative overflow-hidden",
                    bubble.color,
                    bubble.glow,
                    "hover:shadow-xl transform hover:-translate-y-1"
                  )}
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${bubble.color.includes('primary') ? 'hsl(var(--primary-glow))' : bubble.color.includes('blue') ? '#60a5fa' : '#34d399'}, ${bubble.color.includes('primary') ? 'hsl(var(--primary))' : bubble.color.includes('blue') ? '#3b82f6' : '#10b981'})`
                  }}
                  type="button"
                  title={bubble.label}
                  aria-label={bubble.label}
                >
                  <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-white drop-shadow-sm relative z-10" />
                  
                  {/* Circle bubble shine effect */}
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 w-2 h-2 sm:w-3 sm:h-3 bg-white/40 rounded-full blur-sm" />
                  <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/60 rounded-full" />
                </button>

              </div>
            );
          })}

          {/* Mobile-optimized System Status Indicator */}
          <div className="flex items-center justify-center mt-2">
            <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 shadow-xl">
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-muted-foreground font-medium text-xs">AI</span>
                <div className="w-1 h-1 bg-primary rounded-full animate-ping" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile-responsive Active Specialized Bubbles */}
      {activeBubble === "tradesetup" && (
        <div className="fixed inset-x-3 top-4 sm:inset-x-auto sm:right-4 sm:top-20 z-[10000] sm:w-auto sm:max-w-md mobile-fade-in safe-top">
          <TradeSetupBubble
            instrument={instrument}
            timeframe={timeframe}
            onClose={handleCloseBubble}
            onTradeLevelsUpdate={onTradeLevelsUpdate}
          />
        </div>
      )}
      
      {activeBubble === "macro" && (
        <div className="fixed inset-x-3 bottom-4 top-4 sm:inset-x-auto sm:right-4 sm:top-20 z-[10000] max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-6rem)] mobile-fade-in safe-top safe-bottom">
          <MacroCommentary
            instrument={instrument}
            timeframe={timeframe}
            onClose={handleCloseBubble}
          />
        </div>
      )}
      
      {activeBubble === "reports" && (
        <div className="fixed inset-x-3 top-4 sm:inset-x-auto sm:right-4 sm:top-20 z-[10000] sm:w-auto sm:max-w-md mobile-fade-in safe-top">
          <ReportsBubble
            instrument={instrument}
            timeframe={timeframe}
            onClose={handleCloseBubble}
          />
        </div>
      )}
    </>
  );
}