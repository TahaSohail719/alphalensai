import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Scale, DollarSign } from 'lucide-react';
import { BacktestStats } from '@/data/mockBacktesterData';

interface BacktesterSummaryProps {
  stats: BacktestStats;
}

export function BacktesterSummary({ stats }: BacktesterSummaryProps) {
  const isSimulated = stats.simulatedTotalPnL !== undefined;
  
  const statCards = [
    {
      icon: TrendingUp,
      label: 'Total Trades Tested',
      value: stats.totalTrades.toString(),
      delay: '0ms',
    },
    {
      icon: Target,
      label: 'Win Rate',
      value: `${stats.winRate.toFixed(1)}%`,
      delay: '100ms',
      badge: isSimulated ? 'Real Data' : 'Mock',
      badgeVariant: isSimulated ? 'default' : 'outline',
    },
    {
      icon: Scale,
      label: isSimulated ? 'Profit Factor' : 'Average R/R Ratio',
      value: isSimulated && stats.profitFactor 
        ? stats.profitFactor.toFixed(2) 
        : stats.avgRiskReward.toFixed(2),
      delay: '200ms',
    },
    {
      icon: DollarSign,
      label: isSimulated ? 'Total PnL (USD)' : 'Cumulative PnL (%)',
      value: isSimulated && stats.simulatedTotalPnL !== undefined
        ? `$${stats.simulatedTotalPnL >= 0 ? '+' : ''}${stats.simulatedTotalPnL.toFixed(2)}`
        : `${stats.cumulativePnL >= 0 ? '+' : ''}${stats.cumulativePnL.toFixed(1)}%`,
      delay: '300ms',
      highlight: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-primary/20 animate-fade-in"
            style={{ animationDelay: stat.delay }}
          >
            <CardContent className="pt-6 pb-4">
              <div className="flex items-center justify-between mb-2">
                <Icon className="h-5 w-5 text-primary" />
                {stat.highlight && (
                  <span className="text-xs font-medium text-primary">Live</span>
                )}
                {stat.badge && (
                  <Badge variant={stat.badgeVariant as any} className="text-[10px] px-1.5 py-0">
                    {stat.badge}
                  </Badge>
                )}
              </div>
              <div className="space-y-1">
                <p className={`text-2xl font-bold ${stat.highlight ? 'text-primary' : 'text-foreground'}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
