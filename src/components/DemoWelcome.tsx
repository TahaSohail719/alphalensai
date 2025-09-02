import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  BarChart3, 
  Target, 
  FileText,
  ArrowRight,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";

interface DemoWelcomeProps {
  onModuleSelect: (module: string) => void;
}

const features = [
  {
    id: "commentary",
    icon: TrendingUp,
    title: "Macro Commentary Generator",
    description: "AI-powered market analysis with GPT and curated insights",
    benefits: ["Real-time market data", "Fundamental analysis", "Directional bias"],
    color: "primary"
  },
  {
    id: "technical",
    icon: BarChart3,
    title: "Technical Analysis Integration",
    description: "Comprehensive technical indicators and trading signals",
    benefits: ["Multiple timeframes", "Key support/resistance", "Momentum indicators"],
    color: "success"
  },
  {
    id: "trade-ideas",
    icon: Target,
    title: "Trade Idea Recommender",
    description: "Generate complete trade setups with risk management",
    benefits: ["Entry/Exit levels", "Risk-reward ratios", "Position sizing"],
    color: "warning"
  },
  {
    id: "reports",
    icon: FileText,
    title: "Professional Reports",
    description: "Export-ready analysis reports for clients",
    benefits: ["Multiple formats", "Customizable sections", "Professional layout"],
    color: "danger"
  }
];

export function DemoWelcome({ onModuleSelect }: DemoWelcomeProps) {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="relative gradient-primary p-6 sm:p-8 lg:p-12 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col xs:flex-row items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 gradient-success rounded-xl flex items-center justify-center">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-success-foreground" />
              </div>
              <Badge variant="secondary" className="bg-white/10 text-white border-white/20 text-xs sm:text-sm">
                Demo Platform
              </Badge>
            </div>
            <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
              AlphaLens Demo
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-primary-foreground/90 mb-6 sm:mb-8 leading-relaxed px-4">
              Experience the power of AI-driven trading analysis. Test our comprehensive suite 
              of tools designed for professional traders and institutions.
            </p>
            <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center">
              <Button 
                variant="secondary" 
                size="lg"
                onClick={() => onModuleSelect("commentary")}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 w-full xs:w-auto"
              >
                Start Demo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-white/20 text-white hover:bg-white/10 w-full xs:w-auto"
              >
                Watch Overview
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-3">
            Explore Our AI Trading Modules
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Each module demonstrates core capabilities of our AI trading assistant. 
            Click any module to experience it firsthand.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={feature.id}
                className="gradient-card border-border-light shadow-medium hover:shadow-strong transition-smooth cursor-pointer group active:scale-95"
                onClick={() => onModuleSelect(feature.id)}
              >
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 sm:p-3 rounded-lg transition-smooth group-hover:scale-110 shrink-0 ${
                      feature.color === "primary" ? "bg-primary/10 text-primary" :
                      feature.color === "success" ? "bg-success/10 text-success" :
                      feature.color === "warning" ? "bg-warning/10 text-warning" :
                      "bg-danger/10 text-danger"
                    }`}>
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg group-hover:text-primary transition-smooth">
                        {feature.title}
                      </CardTitle>
                      <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 p-4 sm:p-6">
                  <div className="space-y-2">
                    {feature.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                        <span className="text-muted-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-border-light">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="w-full group-hover:bg-accent/50 text-sm"
                    >
                      Try {feature.title.split(' ')[0]} Module
                      <ArrowRight className="h-3 w-3 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <Card className="gradient-card border-border-light shadow-medium">
        <CardContent className="p-6 sm:p-8 text-center">
          <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
            Ready to Experience AI Trading?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            This demo showcases the core capabilities of our AI trading assistant. 
            Start with any module above or begin with our most popular feature.
          </p>
          <div className="flex flex-col xs:flex-row gap-3 justify-center">
            <Button 
              size="lg"
              onClick={() => onModuleSelect("commentary")}
              className="w-full xs:w-auto"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Start with Macro Analysis
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => onModuleSelect("trade-ideas")}
              className="w-full xs:w-auto"
            >
              <Target className="h-4 w-4 mr-2" />
              Generate Trade Ideas
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}