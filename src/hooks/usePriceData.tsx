import { useState, useEffect } from 'react';

export interface PriceDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface UsePriceDataOptions {
  instrument: string | null;
  startDate?: string;
  endDate?: string;
}

export function usePriceData({ instrument, startDate, endDate }: UsePriceDataOptions) {
  const [data, setData] = useState<PriceDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!instrument) {
      setData([]);
      return;
    }

    const fetchPriceData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // For now, generate mock data based on the instrument's recent prices
        // In production, this would call a Supabase edge function or TwelveData API
        const mockData = generateMockPriceData(instrument, startDate, endDate);
        setData(mockData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch price data'));
      } finally {
        setLoading(false);
      }
    };

    fetchPriceData();
  }, [instrument, startDate, endDate]);

  return { data, loading, error };
}

// Generate mock OHLC data for visualization
function generateMockPriceData(instrument: string, startDate?: string, endDate?: string): PriceDataPoint[] {
  const data: PriceDataPoint[] = [];
  const start = startDate ? new Date(startDate) : new Date('2025-08-01');
  const end = endDate ? new Date(endDate) : new Date('2025-10-15');
  
  // Base prices for different instruments
  const basePrices: Record<string, number> = {
    'EUR/USD': 1.07,
    'GBP/USD': 1.28,
    'USD/JPY': 147.5,
    'AUD/USD': 0.67,
    'USD/CAD': 1.35,
    'NZD/USD': 0.61,
    'USD/CHF': 0.88,
    'EUR/GBP': 0.835,
    'GBP/JPY': 189.0,
    'AUD/JPY': 99.0,
    'EUR/JPY': 158.0,
  };
  
  let basePrice = basePrices[instrument] || 1.0;
  const currentDate = new Date(start);
  
  while (currentDate <= end) {
    const volatility = basePrice * 0.005; // 0.5% daily volatility
    const change = (Math.random() - 0.5) * volatility * 2;
    
    const open = basePrice;
    const close = basePrice + change;
    const high = Math.max(open, close) + Math.random() * volatility;
    const low = Math.min(open, close) - Math.random() * volatility;
    
    data.push({
      date: currentDate.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(4)),
      high: parseFloat(high.toFixed(4)),
      low: parseFloat(low.toFixed(4)),
      close: parseFloat(close.toFixed(4)),
    });
    
    basePrice = close;
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return data;
}
