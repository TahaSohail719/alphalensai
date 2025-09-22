// Mapping des actifs vers les symboles Binance WebSocket
export const assetToBinanceSymbol: Record<string, string> = {
  // Forex pairs - Binance format
  'EUR/USD': 'EURUSD',
  'GBP/USD': 'GBPUSD', 
  'USD/JPY': 'USDJPY',
  'AUD/USD': 'AUDUSD',
  'NZD/USD': 'NZDUSD',
  'USD/CHF': 'USDCHF',
  'EUR/GBP': 'EURGBP',
  'EUR/JPY': 'EURJPY',
  
  // Commodities - Binance format
  'GOLD': 'XAUUSD',
  'Gold': 'XAUUSD',
  'SILVER': 'XAGUSD', 
  'Silver': 'XAGUSD',
  'CRUDE': 'USOIL',
  'Crude Oil': 'USOIL',
  
  // Crypto - Binance format (USDT pairs for better liquidity)
  'Bitcoin': 'BTCUSDT',
  'BTC': 'BTCUSDT',
  'Ethereum': 'ETHUSDT',
  'ETH': 'ETHUSDT',
  'BTC-USD': 'BTCUSDT',
  'ETH-USD': 'ETHUSDT',
  'ADA-USD': 'ADAUSDT',
  'SOL-USD': 'SOLUSDT',
  'DOT-USD': 'DOTUSDT',
  'DOGE-USD': 'DOGEUSDT',
  
  // TradingView symbol mappings to Binance
  'EURUSD': 'EURUSD',
  'GBPUSD': 'GBPUSD',
  'USDJPY': 'USDJPY',
  'AUDUSD': 'AUDUSD',
  'NZDUSD': 'NZDUSD',
  'XAUUSD': 'XAUUSD',
  'XAGUSD': 'XAGUSD',
  'BTCUSD': 'BTCUSDT',
  'ETHUSD': 'ETHUSDT'
};

// Mapping des symboles incorrects vers les corrects
const symbolCorrections: Record<string, string> = {
  'AUDUSD=X': 'AUDUSD',
  'NZDUSD=X': 'NZDUSD', 
  'EURGBP=X': 'EURGBP',
  'EURJPY=X': 'EURJPY',
  'USDCHF=X': 'USDCHF',
  'ADA-USD': 'ADAUSDT',
  'SOL-USD': 'SOLUSDT'
};

export const getSymbolForAsset = (asset: string): string => {
  // Correction des symboles mal formatés
  const correctedAsset = symbolCorrections[asset] || asset;
  
  // Retour du symbole Binance correspondant
  return assetToBinanceSymbol[correctedAsset] || 'BTCUSDT'; // Fallback vers BTC
};

export const supportsRealTimeData = (asset: string): boolean => {
  const correctedAsset = symbolCorrections[asset] || asset;
  return !!assetToBinanceSymbol[correctedAsset];
};