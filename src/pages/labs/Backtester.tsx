import { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { SuperUserGuard } from '@/components/SuperUserGuard';
import { LabsComingSoon } from '@/components/labs/LabsComingSoon';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BacktesterSummary } from '@/components/backtester/BacktesterSummary';
import { BacktesterChartPanel } from '@/components/backtester/BacktesterChartPanel';
import { BacktesterTable } from '@/components/backtester/BacktesterTable';
import { BacktesterInsights } from '@/components/backtester/BacktesterInsights';
import { InstrumentSelector } from '@/components/backtester/InstrumentSelector';
import { TradeChartPanel } from '@/components/backtester/TradeChartPanel';
import { usePriceData } from '@/hooks/usePriceData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateStats } from '@/data/mockBacktesterData';
import { useBacktesterData } from '@/hooks/useBacktesterData';
import { Skeleton } from '@/components/ui/skeleton';
import AURA from '@/components/AURA';

function BacktesterContent() {
  const [isAURAExpanded, setIsAURAExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('my-setups');
  const [selectedInstrument, setSelectedInstrument] = useState<string | null>(null);
  
  // Fetch real data
  const { data: myTradeSetups, loading: myLoading } = useBacktesterData({ mode: 'my-setups' });
  const { data: globalTradeSetups, loading: globalLoading } = useBacktesterData({ mode: 'global' });

  // Calculate stats for both datasets
  const myStats = useMemo(() => calculateStats(myTradeSetups), [myTradeSetups]);
  const globalStats = useMemo(() => calculateStats(globalTradeSetups), [globalTradeSetups]);

  // Get unique instruments
  const uniqueInstruments = useMemo(() => {
    const data = activeTab === 'my-setups' ? myTradeSetups : globalTradeSetups;
    return Array.from(new Set(data.map(t => t.instrument))).sort();
  }, [activeTab, myTradeSetups, globalTradeSetups]);

  // Filter trades by selected instrument
  const filteredTrades = useMemo(() => {
    const data = activeTab === 'my-setups' ? myTradeSetups : globalTradeSetups;
    if (!selectedInstrument) return data;
    return data.filter(t => t.instrument === selectedInstrument);
  }, [activeTab, myTradeSetups, globalTradeSetups, selectedInstrument]);

  // Get date range for price data
  const dateRange = useMemo(() => {
    if (filteredTrades.length === 0) return { start: undefined, end: undefined };
    const dates = filteredTrades.map(t => new Date(t.date).getTime());
    return {
      start: new Date(Math.min(...dates) - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date(Math.max(...dates) + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };
  }, [filteredTrades]);

  // Fetch price data for selected instrument
  const { data: priceData, loading: priceLoading } = usePriceData({
    instrument: selectedInstrument,
    startDate: dateRange.start,
    endDate: dateRange.end,
  });

  // Context data for AURA based on active tab
  const contextData = useMemo(() => {
    const isMySetups = activeTab === 'my-setups';
    const stats = isMySetups ? myStats : globalStats;
    const data = isMySetups ? myTradeSetups : globalTradeSetups;

    return {
      page: 'Backtester',
      stats: {
        totalTrades: stats.totalTrades,
        winRate: stats.winRate,
        totalValue: stats.cumulativePnL,
      },
      recentData: data.slice(0, 10),
      filters: { mode: activeTab },
    };
  }, [activeTab, myStats, globalStats, myTradeSetups, globalTradeSetups]);

  return (
    <Layout>
      <div className={`flex h-full relative transition-all ${isAURAExpanded ? 'md:mr-[33.333%]' : ''}`}>
        <div className="flex-1 container-wrapper py-8 px-4 space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">🧠 Beta Feature — Super Users Only</Badge>
            </div>
            <h1 className="text-3xl font-bold">AlphaLens Backtester</h1>
            <p className="text-muted-foreground">
              Replay every AI-generated trade setup.
            </p>
            <p className="text-sm text-muted-foreground">
              Analyze performance of all trade ideas generated across AlphaLens users, or focus on your own setups. 
              Discover strategy robustness and recurring alpha patterns.
            </p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="my-setups" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="my-setups">My Trade Setups</TabsTrigger>
              <TabsTrigger value="global">Global AlphaLens Data</TabsTrigger>
            </TabsList>
            
            <TabsContent value="my-setups" className="space-y-6 mt-6">
              {myLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-96 w-full" />
                </div>
              ) : (
                <>
                  <BacktesterSummary stats={myStats} />
                  <BacktesterChartPanel data={myTradeSetups} />
                  
                  {/* Trade Visualization Panel */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Trade Visualization</CardTitle>
                        <InstrumentSelector
                          instruments={uniqueInstruments}
                          selectedInstrument={selectedInstrument}
                          onSelect={setSelectedInstrument}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {selectedInstrument ? (
                        <div className="space-y-4">
                          <TradeChartPanel
                            instrument={selectedInstrument}
                            trades={filteredTrades}
                            priceData={priceData}
                          />
                          <div>
                            <h4 className="font-semibold mb-3">Trades for {selectedInstrument}</h4>
                            <BacktesterTable trades={filteredTrades} />
                          </div>
                        </div>
                      ) : (
                        <div className="h-[400px] flex items-center justify-center bg-muted/20 rounded-lg">
                          <p className="text-muted-foreground">Select an instrument to view detailed chart with trade pins</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <BacktesterInsights data={myTradeSetups} />
                </>
              )}
            </TabsContent>
            
            <TabsContent value="global" className="space-y-6 mt-6">
              {globalLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-96 w-full" />
                </div>
              ) : (
                <>
                  <BacktesterSummary stats={globalStats} />
                  <BacktesterChartPanel data={globalTradeSetups} />
                  
                  {/* Trade Visualization Panel */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Trade Visualization</CardTitle>
                        <InstrumentSelector
                          instruments={uniqueInstruments}
                          selectedInstrument={selectedInstrument}
                          onSelect={setSelectedInstrument}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      {selectedInstrument ? (
                        <div className="space-y-4">
                          <TradeChartPanel
                            instrument={selectedInstrument}
                            trades={filteredTrades}
                            priceData={priceData}
                          />
                          <div>
                            <h4 className="font-semibold mb-3">Trades for {selectedInstrument}</h4>
                            <BacktesterTable trades={filteredTrades} />
                          </div>
                        </div>
                      ) : (
                        <div className="h-[400px] flex items-center justify-center bg-muted/20 rounded-lg">
                          <p className="text-muted-foreground">Select an instrument to view detailed chart with trade pins</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <BacktesterInsights data={globalTradeSetups} />
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
        
        {/* AURA Assistant */}
        <AURA
          context="Backtester"
          contextData={contextData}
          isExpanded={isAURAExpanded}
          onToggle={() => setIsAURAExpanded(!isAURAExpanded)}
        />
      </div>
    </Layout>
  );
}

export default function Backtester() {
  return (
    <SuperUserGuard
      fallback={
        <Layout>
          <LabsComingSoon 
            title="AlphaLens Backtester"
            description="Backtest AI-generated trade setups across any chosen period. Analyze all AlphaLens trade ideas historically produced across the entire user base, or focus on your own setups."
          />
        </Layout>
      }
    >
      <BacktesterContent />
    </SuperUserGuard>
  );
}
