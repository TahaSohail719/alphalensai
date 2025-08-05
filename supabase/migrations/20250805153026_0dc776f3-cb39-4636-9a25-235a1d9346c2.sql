-- Create instruments table
CREATE TABLE public.instruments (
    id SERIAL PRIMARY KEY,
    symbol TEXT UNIQUE NOT NULL,     -- ex: "APT-USD"
    name TEXT,                       -- Nom complet : "Aptos / USD"
    asset_type TEXT,                 -- ex: "Crypto", "Forex", "Action", "Indice"
    description TEXT,                -- Description libre
    currency TEXT,                   -- Devise de cotation : "USD", "EUR"
    exchange TEXT,                   -- Marché : "Binance", "NASDAQ", "Forex Spot"
    sector TEXT,                      -- Pour actions : "Technology", "Financials"...
    industry TEXT,                    -- Sous-catégorie sectorielle
    inception_date DATE,             -- Date de création / lancement
    website TEXT,                     -- Site officiel
    bloomberg_code TEXT,              -- Code Bloomberg si dispo
    isin TEXT,                        -- ISIN si dispo
    country TEXT,                     -- Pays d'origine
    last_updated TIMESTAMP DEFAULT NOW()
);

-- Create prices table
CREATE TABLE public.prices (
    id SERIAL PRIMARY KEY,
    instrument_id INT NOT NULL REFERENCES public.instruments(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    open NUMERIC,
    high NUMERIC,
    low NUMERIC,
    close NUMERIC,
    volume NUMERIC,
    UNIQUE(instrument_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.instruments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prices ENABLE ROW LEVEL SECURITY;

-- Create policies for instruments (read-only for everyone since it's market data)
CREATE POLICY "Anyone can view instruments" 
ON public.instruments 
FOR SELECT 
USING (true);

-- Create policies for prices (read-only for everyone since it's market data)
CREATE POLICY "Anyone can view prices" 
ON public.prices 
FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_last_updated_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates on instruments
CREATE TRIGGER update_instruments_last_updated
    BEFORE UPDATE ON public.instruments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_last_updated_column();

-- Create indexes for better performance
CREATE INDEX idx_instruments_symbol ON public.instruments(symbol);
CREATE INDEX idx_instruments_asset_type ON public.instruments(asset_type);
CREATE INDEX idx_prices_instrument_date ON public.prices(instrument_id, date);
CREATE INDEX idx_prices_date ON public.prices(date);