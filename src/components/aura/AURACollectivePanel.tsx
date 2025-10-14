import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, FileText, Newspaper, Globe, Loader2 } from 'lucide-react';
import { useCollectiveInsights } from '@/hooks/useCollectiveInsights';
import { format } from 'date-fns';

interface CollectivePanelProps {
  onInsightClick: (insight: string) => void;
}

export function AURACollectivePanel({ onInsightClick }: CollectivePanelProps) {
  const { fetchCollectiveInsights, isLoading } = useCollectiveInsights();
  const [tradeSetups, setTradeSetups] = useState<any[]>([]);
  const [macroCommentaries, setMacroCommentaries] = useState<any[]>([]);
  const [abcgInsights, setAbcgInsights] = useState<any[]>([]);
  const [instrumentFocus, setInstrumentFocus] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [trades, macros, abcg, focus] = await Promise.all([
      fetchCollectiveInsights('trade_setups', 10),
      fetchCollectiveInsights('macro_commentary', 10),
      fetchCollectiveInsights('abcg_insights', 10),
      fetchCollectiveInsights('instrument_focus', 10),
    ]);

    setTradeSetups(trades);
    setMacroCommentaries(macros);
    setAbcgInsights(abcg);
    setInstrumentFocus(focus);
  };

  if (isLoading) {
    return (
      <Card className="p-4 flex items-center justify-center h-[300px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <Tabs defaultValue="focus">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="focus">
            <Globe className="h-4 w-4 mr-2" />
            Focus
          </TabsTrigger>
          <TabsTrigger value="trades">
            <TrendingUp className="h-4 w-4 mr-2" />
            Setups
          </TabsTrigger>
          <TabsTrigger value="macro">
            <FileText className="h-4 w-4 mr-2" />
            Macro
          </TabsTrigger>
          <TabsTrigger value="research">
            <Newspaper className="h-4 w-4 mr-2" />
            ABCG
          </TabsTrigger>
        </TabsList>

        <TabsContent value="focus">
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {instrumentFocus.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
              ) : (
                instrumentFocus.map((item, idx) => (
                  <Card 
                    key={idx}
                    className="p-3 cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => onInsightClick(`Tell me about ${item.instrument} based on community data`)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.instrument}</span>
                      <Badge variant="secondary">{item.count} setups</Badge>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="trades">
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {tradeSetups.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
              ) : (
                tradeSetups.map((setup, idx) => (
                  <Card 
                    key={idx}
                    className="p-3 cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => onInsightClick(`Analyze recent ${setup.instrument} setups from the community`)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{setup.instrument}</span>
                      {setup.direction && (
                        <Badge variant={setup.direction === 'Long' ? 'default' : 'destructive'}>
                          {setup.direction}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {setup.confidence && `Confidence: ${setup.confidence}% • `}
                      {setup.created_at && format(new Date(setup.created_at), 'MMM dd, HH:mm')}
                    </div>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="macro">
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {macroCommentaries.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
              ) : (
                macroCommentaries.map((macro, idx) => (
                  <Card 
                    key={idx}
                    className="p-3 cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => onInsightClick(`Summarize recent macro analysis for ${macro.instrument}`)}
                  >
                    <div className="font-medium mb-1">{macro.instrument}</div>
                    {macro.summary && (
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {macro.summary}
                      </div>
                    )}
                    {macro.created_at && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {format(new Date(macro.created_at), 'MMM dd, HH:mm')}
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="research">
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {abcgInsights.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
              ) : (
                abcgInsights.map((insight, idx) => (
                  <Card 
                    key={idx}
                    className="p-3 cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => onInsightClick(`What does ABCG Research say about ${insight.tickers?.[0] || 'the market'}?`)}
                  >
                    {insight.title && (
                      <div className="font-medium mb-1">{insight.title}</div>
                    )}
                    {insight.content && (
                      <div className="text-sm text-muted-foreground line-clamp-3">
                        {insight.content}
                      </div>
                    )}
                    {insight.topics && insight.topics.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {insight.topics.slice(0, 3).map((topic, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
