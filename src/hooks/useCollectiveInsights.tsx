import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CollectiveInsight {
  instrument?: string;
  direction?: string;
  confidence?: number;
  summary?: string;
  content?: string;
  title?: string;
  topics?: string[];
  tickers?: string[];
  count?: number;
  created_at?: string;
}

export function useCollectiveInsights() {
  const [isLoading, setIsLoading] = useState(false);

  const fetchCollectiveInsights = useCallback(async (
    type: 'trade_setups' | 'macro_commentary' | 'reports' | 'abcg_insights' | 'instrument_focus',
    limit = 10
  ): Promise<CollectiveInsight[]> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('collective-insights', {
        body: { type, limit }
      });

      if (error) throw error;
      return data?.data || [];
    } catch (error) {
      console.error('Error fetching collective insights:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { fetchCollectiveInsights, isLoading };
}
