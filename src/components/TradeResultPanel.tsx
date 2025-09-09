import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Copy, Download, ChevronDown, Target, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface TradingSetup {
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
}

interface MarketCommentary {
  summary: string;
  key_drivers: string[];
}

interface TradeResult {
  instrument: string;
  asOf: string;
  market_commentary_anchor: MarketCommentary;
  setups: TradingSetup[];
  disclaimer: string;
}

interface TradeResultPanelProps {
  result: TradeResult;
  rawResponse: any;
}

export default function TradeResultPanel({ result, rawResponse }: TradeResultPanelProps) {
  const { toast } = useToast();
  const [openAccordions, setOpenAccordions] = useState<number[]>([]);

  const copyJsonToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(rawResponse, null, 2));
    toast({
      title: "JSON Copied",
      description: "The complete JSON response has been copied to clipboard.",
    });
  };

  const exportToCsv = () => {
    const headers = ["Horizon", "Timeframe", "Strategy", "Direction", "Entry", "Stop", "TakeProfits", "RRR", "Confidence"];
    const csvData = result.setups.map(setup => [
      setup.horizon,
      setup.timeframe,
      setup.strategy,
      setup.direction,
      setup.entryPrice,
      setup.stopLoss,
      setup.takeProfits.join(';'),
      setup.riskRewardRatio,
      setup.strategyMeta.confidence
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trade-setups-${result.instrument}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "CSV Exported",
      description: "Trade setups have been exported to CSV file.",
    });
  };

  const toggleAccordion = (index: number) => {
    setOpenAccordions(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 mt-8">
      <Card className="gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Résultats du Trade Setup
            <Badge variant="outline" className="ml-auto">
              {result.instrument}
            </Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Généré le {formatDate(result.asOf)}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Market Commentary */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Commentaire de Marché
              </h4>
              <p className="text-sm leading-relaxed text-muted-foreground bg-muted/50 p-3 rounded-lg">
                {result.market_commentary_anchor.summary}
              </p>
            </div>

            <div>
              <h5 className="font-medium text-foreground mb-2">Facteurs Clés</h5>
              <div className="flex flex-wrap gap-2">
                {result.market_commentary_anchor.key_drivers.map((driver, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {driver}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Setups Table */}
          <div>
            <h4 className="font-semibold text-foreground mb-3">Configurations de Trading</h4>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Horizon</TableHead>
                    <TableHead>Timeframe</TableHead>
                    <TableHead>Stratégie</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Entrée</TableHead>
                    <TableHead>Stop</TableHead>
                    <TableHead>Take Profits</TableHead>
                    <TableHead>RRR</TableHead>
                    <TableHead>Confiance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.setups.map((setup, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{setup.horizon}</TableCell>
                      <TableCell>{setup.timeframe}</TableCell>
                      <TableCell>{setup.strategy}</TableCell>
                      <TableCell>
                        <Badge variant={setup.direction === 'long' ? 'default' : 'destructive'}>
                          {setup.direction}
                        </Badge>
                      </TableCell>
                      <TableCell>{setup.entryPrice}</TableCell>
                      <TableCell>{setup.stopLoss}</TableCell>
                      <TableCell>{setup.takeProfits.join(', ')}</TableCell>
                      <TableCell>{setup.riskRewardRatio}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {Math.round(setup.strategyMeta.confidence * 100)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Setup Details Accordions */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">Notes et Risques</h4>
            {result.setups.map((setup, index) => (
              <Collapsible key={index} open={openAccordions.includes(index)}>
                <CollapsibleTrigger 
                  onClick={() => toggleAccordion(index)}
                  className="w-full"
                >
                  <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          Setup {index + 1}: {setup.horizon} - {setup.strategy}
                        </span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${
                          openAccordions.includes(index) ? 'rotate-180' : ''
                        }`} />
                      </div>
                    </CardHeader>
                  </Card>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Card className="mt-2 border-l-4 border-l-primary">
                    <CardContent className="pt-4 space-y-3">
                      <div>
                        <h6 className="font-medium text-sm text-foreground mb-1">Contexte</h6>
                        <p className="text-sm text-muted-foreground">{setup.context}</p>
                      </div>
                      <div>
                        <h6 className="font-medium text-sm text-foreground mb-1">Notes de Risque</h6>
                        <p className="text-sm text-muted-foreground">{setup.riskNotes}</p>
                      </div>
                    </CardContent>
                  </Card>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800">{result.disclaimer}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={copyJsonToClipboard} variant="outline" size="sm">
              <Copy className="mr-2 h-4 w-4" />
              Copier le JSON
            </Button>
            <Button onClick={exportToCsv} variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exporter CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}