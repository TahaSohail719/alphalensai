
# Plan : Création de la page "Trade Generator" (Forecast + AI Setup combinés)

## Objectif
Créer une nouvelle page dans le hub Forecast Playground qui combine :
1. **Les paramètres du Forecast Playground** (symbol, timeframe, horizons, monte carlo, etc.)
2. **Les paramètres de l'AI Setup** (strategy, riskLevel, customNotes)
3. Envoie une requête unifiée avec `mode: "trade_generation"` à la même URI que Forecast Playground
4. Affiche les résultats dans un format hybride :
   - Section **Forecast** (données issues de `response.trade_setup`)
   - Section **Trade Setup** (données à la racine du JSON, format AI Setup)

---

## Architecture des données

### Payload de requête (intersection)
```text
{
  // === Paramètres Forecast Playground ===
  symbol: "EUR/USD",
  timeframe: "15min",
  horizons: [24],
  trade_mode: "forward",
  use_montecarlo: true,
  paths: 3000,
  include_predictions: true,
  include_metadata: false,
  include_model_info: false,
  skew: 0.0,
  
  // === Paramètres AI Setup ===
  instrument: "EUR/USD",  // Redondant mais explicite
  riskLevel: "medium",
  strategy: "breakout",
  customNotes: "...",
  
  // === Mode spécial ===
  mode: "trade_generation"  // CRITIQUE : identifie le type de requête
}
```

### Format de réponse attendu
```text
{
  // === Racine : données AI Setup ===
  instrument: "EUR/USD",
  asOf: "2025-01-26T10:00:00Z",
  market_commentary_anchor: { summary: "...", key_drivers: [...] },
  setups: [
    {
      horizon: "Intraday",
      timeframe: "4h",
      strategy: "breakout",
      direction: "LONG",
      entryPrice: 1.0850,
      stopLoss: 1.0800,
      takeProfits: [1.0900, 1.0950],
      riskRewardRatio: 2.5,
      supports: [...],
      resistances: [...],
      context: "...",
      riskNotes: "..."
    }
  ],
  disclaimer: "...",
  
  // === Nouveau champ : données Forecast Playground ===
  trade_setup: {
    payload: {
      horizons: [
        {
          h: "24h",
          direction: "long",
          entry_price: 1.0850,
          forecast: { medianPrice: 1.0870, p20: 1.0820, p80: 1.0920 },
          tp: 1.0900,
          sl: 1.0800,
          riskReward: 2.0,
          prob_hit_tp_before_sl: 0.62,
          confidence: 0.75
        }
      ]
    },
    metadata: { ... },
    predictions: { ... }
  }
}
```

---

## Fichiers à créer/modifier

### 1. Nouvelle page : `src/pages/ForecastTradeGenerator.tsx`
Page autonome combinant les deux fonctionnalités.

**Structure UI :**
- Header avec titre "Trade Generator" et badge "Internal"
- Section formulaire :
  - Card "Market Context" (symbol, timeframe, horizons)
  - Card "Trade Parameters" (strategy, riskLevel, customNotes)
  - Card "Model Options" (monte carlo, paths, advanced)
- Bouton "Generate Trade"
- Section résultats (affichée après réponse) :
  - Onglet "Trade Setup" : affichage format AI Setup (setups cards)
  - Onglet "Forecast Data" : affichage format Forecast Playground (horizon table + risk profiles)
  - Onglet "Debug" (toggle) : JSON brut

### 2. Modification du Hub : `src/pages/ForecastPlayground.tsx`
Ajouter une 3ème carte pour accéder à la nouvelle page.

```text
+----------------------------------------+
| Trade Generator                        |
| Combines Forecast + AI Setup in one    |
| unified workflow.                      |
|                                        |
| [Open tool] [Open in new tab]          |
+----------------------------------------+
```

### 3. Nouvelle route : `src/App.tsx`
Ajouter la route :
```
/forecast-playground/trade-generator → ForecastTradeGenerator
```

---

## Logique de la nouvelle page

### État du formulaire
```typescript
// Forecast params
const [symbol, setSymbol] = useState("EUR/USD");
const [timeframe, setTimeframe] = useState("15min");
const [horizons, setHorizons] = useState("24");
const [useMonteCarlo, setUseMonteCarlo] = useState(true);
const [paths, setPaths] = useState(3000);
const [skew, setSkew] = useState(0.0);

// AI Setup params
const [riskLevel, setRiskLevel] = useState("medium");
const [strategy, setStrategy] = useState("breakout");
const [customNotes, setCustomNotes] = useState("");

// Request state
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [result, setResult] = useState<any>(null);
```

### Fonction de soumission
1. Construire le payload combiné avec `mode: "trade_generation"`
2. Appeler `fetch("https://...supabase.co/functions/v1/forecast-proxy", {...})`
3. Parser la réponse :
   - Racine → données AI Setup (normalizeN8n existant)
   - `response.trade_setup` → données Forecast (getPayloadHorizons adapté)
4. Afficher les deux sections

### Affichage des résultats
- Réutiliser le composant `TradeForecastTable` du Forecast Playground pour `trade_setup`
- Réutiliser la logique d'affichage des Cards de l'AI Setup pour les `setups` à la racine
- Les deux sections sont affichées simultanément (pas d'onglets exclusifs)

---

## Points techniques critiques

1. **Le champ `mode: "trade_generation"`** doit être injecté dans le payload pour que le backend sache qu'il s'agit d'une requête combinée.

2. **URI identique** : on utilise la même URI que Forecast Playground (`/functions/v1/forecast-proxy`). Le backend différencie grâce au champ `mode`.

3. **Pas de régression** : les pages Forecast Playground Tool et AI Setup restent inchangées.

4. **Protection SuperUser** : comme les autres pages du hub, cette page sera encapsulée dans `SuperUserGuard`.

---

## Ordre d'implémentation

1. Créer `src/pages/ForecastTradeGenerator.tsx` avec le formulaire et la logique de requête
2. Ajouter la route dans `src/App.tsx`
3. Ajouter la carte dans le hub `src/pages/ForecastPlayground.tsx`
4. Tester le flux complet
