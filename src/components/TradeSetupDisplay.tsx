import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface TradeSetupDisplayProps {
  data: any;
}

export const TradeSetupDisplay: React.FC<TradeSetupDisplayProps> = ({ data }) => {
  if (!data) {
    return <div className="text-muted-foreground">No trade setup data available</div>;
  }

  const {
    instrument,
    timeframe,
    horizon,
    strategy,
    direction,
    entry,
    stop_loss,
    targets,
    key_levels,
    risk_reward,
    confidence,
    position_size,
    context,
    reasoning
  } = data;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-semibold">Trade Setup Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <span className="text-sm font-medium text-muted-foreground">Instrument</span>
              <p className="text-lg font-semibold">{instrument}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Timeframe</span>
              <p className="text-lg font-semibold">{timeframe}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Horizon</span>
              <p className="text-lg font-semibold">{horizon}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Strategy</span>
              <p className="text-lg font-semibold">{strategy}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-muted-foreground">Direction</span>
              <Badge variant={direction?.toLowerCase() === 'long' ? 'default' : 'destructive'} className="text-sm">
                {direction}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trade Levels Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Trade Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Entry Level</span>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xl font-bold text-primary">{entry}</p>
              </div>
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Stop Loss</span>
              <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                <p className="text-xl font-bold text-destructive">{stop_loss}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Targets Section */}
      {targets && targets.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Price Targets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {targets.map((target: any, index: number) => (
                <div key={index} className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      TP{index + 1}
                    </span>
                    <span className="text-lg font-bold text-primary">{target}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Levels Section */}
      {key_levels && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Key Levels</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {key_levels.support && key_levels.support.length > 0 && (
              <div>
                <span className="text-sm font-medium text-muted-foreground mb-2 block">Support Levels</span>
                <div className="flex flex-wrap gap-2">
                  {key_levels.support.map((level: string, index: number) => (
                    <Badge key={index} variant="outline" className="bg-primary/5 border-primary/20">
                      {level}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {key_levels.resistance && key_levels.resistance.length > 0 && (
              <div>
                <span className="text-sm font-medium text-muted-foreground mb-2 block">Resistance Levels</span>
                <div className="flex flex-wrap gap-2">
                  {key_levels.resistance.map((level: string, index: number) => (
                    <Badge key={index} variant="outline" className="bg-destructive/5 border-destructive/20">
                      {level}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Risk Metrics Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Risk Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {risk_reward && (
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Risk/Reward</span>
                <p className="text-2xl font-bold text-primary">{risk_reward}</p>
              </div>
            )}
            {confidence && (
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Confidence</span>
                <p className="text-2xl font-bold text-primary">{confidence}</p>
              </div>
            )}
            {position_size && (
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Position Size</span>
                <p className="text-2xl font-bold text-primary">{position_size}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Context & Reasoning */}
      {(context || reasoning) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {context && (
              <div>
                <span className="text-sm font-medium text-muted-foreground mb-2 block">Market Context</span>
                <p className="text-sm leading-relaxed">{context}</p>
              </div>
            )}
            {reasoning && (
              <div>
                <span className="text-sm font-medium text-muted-foreground mb-2 block">Trade Reasoning</span>
                <p className="text-sm leading-relaxed">{reasoning}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};