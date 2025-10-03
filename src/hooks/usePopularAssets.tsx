import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Asset {
  symbol: string;
  name: string;
  icon: string;
}

export const usePopularAssets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('asset_profiles' as any)
          .select('symbol, name, short_name')
          .in('quote_type', ['CURRENCY', 'CRYPTOCURRENCY'])
          .order('market_cap', { ascending: false, nullsFirst: false })
          .limit(20);

        if (error) throw error;

        // Transform to match expected format
        const transformedAssets: Asset[] = (data || []).map((asset: any) => ({
          symbol: asset.symbol,
          name: asset.short_name || asset.name || asset.symbol,
          icon: asset.symbol.includes('BTC') || asset.symbol.includes('ETH') ? '₿' : 
                asset.symbol.includes('EUR') || asset.symbol.includes('USD') ? '💱' : '📈'
        }));

        setAssets(transformedAssets);
        setError(null);
      } catch (err) {
        console.error('Error fetching popular assets:', err);
        setError('Failed to load assets');
        // Fallback to empty array
        setAssets([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssets();
  }, []);

  return { assets, isLoading, error };
};
