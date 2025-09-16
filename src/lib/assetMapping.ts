// Mapping des actifs vers les symboles Twelve Data
export const assetToTwelveDataSymbol: Record<string, string> = {
  'EUR/USD': 'EURUSD',
  'GBP/USD': 'GBPUSD',
  'USD/JPY': 'USDJPY',
  'GOLD': 'XAUUSD',
  'Gold': 'XAUUSD',
  'SILVER': 'XAGUSD',
  'Silver': 'XAGUSD',
  'CRUDE': 'BRENTOIL',
  'Crude Oil': 'BRENTOIL',
  'Bitcoin': 'BTCUSD',
  'Ethereum': 'ETHUSD',
  'BTC': 'BTCUSD',
  'ETH': 'ETHUSD'
};

// Tous les actifs supportent maintenant les données en temps réel
export const getSymbolForAsset = (asset: string): string => {
  return assetToTwelveDataSymbol[asset] || 'EURUSD'; // Fallback vers EUR/USD
};

// Tous les actifs ont des données temps réel
export const supportsRealTimeData = (asset: string): boolean => {
  return true; // Tous les actifs supportent maintenant le temps réel
};