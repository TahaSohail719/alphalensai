import Layout from '@/components/Layout';
import PNLCalculator from '@/components/PNLCalculator';
import { Calculator } from 'lucide-react';

export default function PNLCalculatorPage() {
  return (
    <Layout>
      <div className="container-wrapper space-y-6">
        {/* Page Header */}
        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calculator className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Risk Management Calculator</h1>
              <p className="text-muted-foreground">
                Calculate your position size and PNL projections before entering a trade
              </p>
            </div>
          </div>
        </header>

        {/* Calculator Component */}
        <div className="max-w-2xl">
          <PNLCalculator 
            defaultInstrument="EUR/USD"
            showInstrumentPicker={true}
          />
        </div>

        {/* Educational Info */}
        <div className="max-w-2xl space-y-4 p-6 bg-muted/20 rounded-lg border border-border">
          <h3 className="font-semibold text-lg">How to use this calculator</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>Select your instrument from the dropdown (major FX pairs, crypto, or commodities)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>Adjust position size in lots (0.01 - 10)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>Set your leverage (1x - 500x)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>Enter price change in pips (for FX) or percentage (for crypto/commodities)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>View projected PNL in USD and as a percentage of your margin</span>
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
