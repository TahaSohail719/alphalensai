import { useEffect, useRef, useState } from 'react';
import { BacktestTradeSetup } from '@/data/mockBacktesterData';
import { PriceDataPoint } from '@/hooks/usePriceData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Scatter, ComposedChart } from 'recharts';

interface TradeChartPanelProps {
  instrument: string;
  trades: BacktestTradeSetup[];
  priceData: PriceDataPoint[];
}

export function TradeChartPanel({ instrument, trades, priceData }: TradeChartPanelProps) {
  const [selectedTrade, setSelectedTrade] = useState<BacktestTradeSetup | null>(null);

  if (priceData.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-muted/20 rounded-lg">
        <p className="text-muted-foreground">Loading price data for {instrument}...</p>
      </div>
    );
  }

  // Combine price data with trade markers
  const chartData = priceData.map(point => {
    const trade = trades.find(t => t.date === point.date);
    return {
      ...point,
      trade: trade || null,
    };
  });

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!payload.trade) return null;

    const trade = payload.trade;
    const isLong = trade.direction === 'Long';
    const isWin = trade.status === 'TP Hit';
    const color = isWin ? '#10b981' : '#ef4444';

    return (
      <g onClick={() => setSelectedTrade(trade)} style={{ cursor: 'pointer' }}>
        {isLong ? (
          <polygon
            points={`${cx},${cy - 8} ${cx - 6},${cy + 4} ${cx + 6},${cy + 4}`}
            fill={color}
            stroke="#fff"
            strokeWidth={1}
          />
        ) : (
          <polygon
            points={`${cx},${cy + 8} ${cx - 6},${cy - 4} ${cx + 6},${cy - 4}`}
            fill={color}
            stroke="#fff"
            strokeWidth={1}
          />
        )}
      </g>
    );
  };

  return (
    <>
      <div className="w-full h-[400px] bg-muted/10 rounded-lg p-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date" 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af' }}
            />
            <YAxis 
              domain={['dataMin - 0.01', 'dataMax + 0.01']}
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#f9fafb'
              }}
            />
            <Legend />
            
            {/* Price line */}
            <Line 
              type="monotone" 
              dataKey="close" 
              stroke="#06b6d4" 
              strokeWidth={2}
              dot={false}
              name="Close Price"
            />

            {/* Trade markers */}
            <Scatter 
              dataKey="close" 
              fill="#8884d8"
              shape={<CustomDot />}
            />

            {/* Add reference lines for each trade */}
            {trades.map((trade, idx) => (
              <g key={idx}>
                <ReferenceLine 
                  y={trade.entry} 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  label={{ value: `Entry ${trade.entry.toFixed(4)}`, fill: '#2563eb', fontSize: 10 }}
                />
                <ReferenceLine 
                  y={trade.tp} 
                  stroke="#10b981" 
                  strokeDasharray="3 3"
                  label={{ value: `TP ${trade.tp.toFixed(4)}`, fill: '#10b981', fontSize: 10 }}
                />
                <ReferenceLine 
                  y={trade.sl} 
                  stroke="#ef4444" 
                  strokeDasharray="3 3"
                  label={{ value: `SL ${trade.sl.toFixed(4)}`, fill: '#ef4444', fontSize: 10 }}
                />
              </g>
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {/* Trade Details Modal */}
      <Dialog open={!!selectedTrade} onOpenChange={() => setSelectedTrade(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trade Details - {selectedTrade?.instrument}</DialogTitle>
          </DialogHeader>
          {selectedTrade && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-semibold">{selectedTrade.date}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Direction</p>
                  <Badge variant={selectedTrade.direction === 'Long' ? 'default' : 'secondary'}>
                    {selectedTrade.direction}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Entry</p>
                  <p className="font-semibold">{selectedTrade.entry.toFixed(4)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Take Profit</p>
                  <p className="font-semibold text-green-500">{selectedTrade.tp.toFixed(4)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Stop Loss</p>
                  <p className="font-semibold text-red-500">{selectedTrade.sl.toFixed(4)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={selectedTrade.status === 'TP Hit' ? 'default' : 'destructive'}>
                    {selectedTrade.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">PnL</p>
                  <p className={`font-semibold ${selectedTrade.pnl_percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {selectedTrade.pnl_percent >= 0 ? '+' : ''}{selectedTrade.pnl_percent.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Confidence</p>
                  <p className="font-semibold">{selectedTrade.confidence}%</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
