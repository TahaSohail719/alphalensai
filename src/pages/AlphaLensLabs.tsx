import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import PNLCalculator from '@/components/PNLCalculator';
import PortfolioAnalysis from '@/components/PortfolioAnalysis';
import AICoPilot from '@/components/AICoPilot';
import PortfolioSelector from '@/components/PortfolioSelector';
import { mockTrades, MockTrade } from '@/data/mockPortfolio';
import { supabase } from '@/integrations/supabase/client';
import { Beaker, Target, Sparkles, Globe, TrendingUp, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function AlphaLensLabs() {
  const [isCoPilotExpanded, setIsCoPilotExpanded] = useState(false);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null);
  const [trades, setTrades] = useState<MockTrade[]>(mockTrades);
  const [loading, setLoading] = useState(false);
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);

  useEffect(() => {
    if (selectedPortfolioId) {
      fetchPortfolioPositions(selectedPortfolioId);
    } else {
      setTrades(mockTrades);
    }
  }, [selectedPortfolioId]);

  const fetchPortfolioPositions = async (portfolioId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('positions')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedTrades: MockTrade[] = (data || []).map((position) => {
        const pnl = position.market_value || 0;
        const entry = position.average_price || 0;
        const exit = position.current_price || entry;
        const direction = pnl >= 0 ? 'long' : 'short';

        return {
          id: position.id,
          instrument: position.symbol,
          size: position.quantity || 1,
          direction: direction as 'long' | 'short',
          entry,
          exit,
          pnl,
          duration: '1d',
          timestamp: new Date(position.created_at).toISOString(),
          leverage: 1,
        };
      });

      setTrades(mappedTrades);
    } catch (error) {
      console.error('Error fetching portfolio positions:', error);
      setTrades(mockTrades);
    } finally {
      setLoading(false);
    }
  };

  const upcomingTools = [
    {
      id: 'risk-profiler',
      name: 'Smart Risk Profiler',
      description: 'AI-powered portfolio risk assessment with real-time adjustments',
      icon: Target,
      status: 'Coming Soon',
      estimatedLaunch: 'Q1 2025'
    },
    {
      id: 'alpha-generator',
      name: 'Alpha Generator',
      description: 'Machine learning models to identify trading opportunities',
      icon: Sparkles,
      status: 'Beta 2025',
      estimatedLaunch: 'Q2 2025'
    },
    {
      id: 'macro-simulator',
      name: 'Macro Scenario Simulator',
      description: 'Test portfolio resilience under various economic scenarios',
      icon: Globe,
      status: 'Under Development',
      estimatedLaunch: 'Q3 2025'
    }
  ];

  return (
    <Layout>
      <div className="flex h-full relative">
        {/* Main Content */}
        <div className={cn('flex-1 transition-all duration-300', isCoPilotExpanded ? 'md:mr-[33.333%]' : 'mr-0')}>
          <div className="container-wrapper space-y-6 sm:space-y-8 flex flex-col items-center min-h-screen py-6 sm:py-8 px-4">
            
            {/* Hero Section */}
            <header className="space-y-4 w-full max-w-6xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl shrink-0">
                  <Beaker className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    AlphaLens Labs
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground mt-2">
                    Welcome to AlphaLens Labs — your AI workspace for market intelligence, portfolio analytics, and experimental tools.
                  </p>
                </div>
              </div>
            </header>

            {/* AI Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
              
              {/* Active Tool 1: Portfolio Analytics Suite */}
              <Card className="group hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Portfolio Analytics Suite
                    </CardTitle>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <CardDescription>
                    Comprehensive portfolio analysis and PNL calculation tools with AI-powered insights
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <Collapsible open={isPortfolioOpen} onOpenChange={setIsPortfolioOpen}>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" className="w-full gap-2">
                        {isPortfolioOpen ? 'Hide Tools' : 'View Tools'}
                        <ChevronDown className={cn('h-4 w-4 transition-transform', isPortfolioOpen && 'rotate-180')} />
                      </Button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="space-y-4 mt-4">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-sm font-medium">Portfolio:</span>
                        <PortfolioSelector
                          selectedId={selectedPortfolioId}
                          onSelect={setSelectedPortfolioId}
                        />
                      </div>
                      
                      <Tabs defaultValue="calculator" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="calculator">PNL Calculator</TabsTrigger>
                          <TabsTrigger value="analysis">Portfolio Analysis</TabsTrigger>
                        </TabsList>

                        <TabsContent value="calculator" className="space-y-4 mt-4">
                          <PNLCalculator defaultInstrument="EUR/USD" showInstrumentPicker={true} />
                        </TabsContent>

                        <TabsContent value="analysis" className="mt-4">
                          {loading ? (
                            <div className="text-center py-8 text-muted-foreground">
                              Loading portfolio data...
                            </div>
                          ) : (
                            <PortfolioAnalysis trades={trades} />
                          )}
                        </TabsContent>
                      </Tabs>
                    </CollapsibleContent>
                  </Collapsible>
                </CardContent>
              </Card>

              {/* Upcoming Tools */}
              {upcomingTools.map((tool) => (
                <Card 
                  key={tool.id} 
                  className="relative overflow-hidden opacity-60 cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-transparent pointer-events-none" />
                  <CardHeader>
                    <Badge variant="outline" className="w-fit mb-2">{tool.status}</Badge>
                    <CardTitle className="flex items-center gap-2 text-muted-foreground">
                      <tool.icon className="h-5 w-5" />
                      {tool.name}
                    </CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <p className="text-xs text-muted-foreground">
                      Estimated: {tool.estimatedLaunch}
                    </p>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* AI Co-Pilot Panel */}
        <AICoPilot 
          trades={trades} 
          isExpanded={isCoPilotExpanded} 
          onToggle={() => setIsCoPilotExpanded(!isCoPilotExpanded)} 
        />
      </div>
    </Layout>
  );
}
