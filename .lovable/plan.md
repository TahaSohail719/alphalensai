
# Plan: Corriger les Extracteurs de Données Trade Generator

## Diagnostic du Problème

L'API renvoie un status 200 avec les données, mais les extracteurs ne trouvent pas les données car le chemin est different:

**Chemin actuel (que les extracteurs cherchent):**
```
output.trade_generation_output.final_answer
output.trade_generation_output.trade_setup
output.trade_generation_output.risk_surface
output.trade_generation_output.confidence_note
```

**Chemin réel dans la réponse API (vu dans les network logs):**
```
body.message.message.content.content.final_answer
body.message.message.content.content.trade_setup
body.message.message.content.content.risk_surface
```

La structure reçue est:
```json
{
  "statusCode": 200,
  "body": {
    "message": {
      "status": "done",
      "message": {
        "content": {
          "content": {
            "final_answer": "{ JSON stringified }",
            "trade_setup": [{ ... }],
            ...
          }
        }
      }
    }
  }
}
```

---

## Modifications Techniques

### Fichier: `src/pages/ForecastTradeGenerator.tsx`

#### 1. Mettre à jour `extractFinalAnswer` pour chercher dans le bon chemin

```typescript
function extractFinalAnswer(raw: unknown): string | null {
  const obj = raw as Record<string, unknown>;
  
  // Path 1: body.message.message.content.content.final_answer (actual API response)
  try {
    const body = obj?.body as Record<string, unknown>;
    const message1 = body?.message as Record<string, unknown>;
    const message2 = message1?.message as Record<string, unknown>;
    const content1 = message2?.content as Record<string, unknown>;
    const content2 = content1?.content as Record<string, unknown>;
    if (typeof content2?.final_answer === "string") {
      return content2.final_answer;
    }
  } catch {}
  
  // Path 2: output.trade_generation_output.final_answer (legacy/expected)
  if (obj?.output && typeof obj.output === "object") {
    const output = obj.output as Record<string, unknown>;
    if (output?.trade_generation_output && typeof output.trade_generation_output === "object") {
      const tgo = output.trade_generation_output as Record<string, unknown>;
      if (typeof tgo?.final_answer === "string") {
        return tgo.final_answer;
      }
    }
  }
  
  return null;
}
```

#### 2. Mettre à jour `extractTradeSetup` pour le nouveau chemin

```typescript
function extractTradeSetup(raw: unknown): TradeSetupResponse | null {
  const obj = raw as Record<string, unknown>;
  
  // Path 1: body.message.message.content.content.trade_setup (actual API)
  try {
    const body = obj?.body as Record<string, unknown>;
    const message1 = body?.message as Record<string, unknown>;
    const message2 = message1?.message as Record<string, unknown>;
    const content1 = message2?.content as Record<string, unknown>;
    const content2 = content1?.content as Record<string, unknown>;
    if (content2?.trade_setup) {
      let setup = content2.trade_setup;
      // Handle array format (API returns array of stringified JSON)
      if (Array.isArray(setup) && setup.length > 0) {
        const first = setup[0];
        if (typeof first === "string") {
          try { setup = JSON.parse(first); } catch { return null; }
        } else {
          setup = first;
        }
      } else if (typeof setup === "string") {
        try { setup = JSON.parse(setup); } catch { return null; }
      }
      return setup as TradeSetupResponse;
    }
  } catch {}
  
  // Path 2: Legacy paths...
  // (keep existing code as fallback)
  
  return null;
}
```

#### 3. Mettre à jour `extractRiskSurface` pour le nouveau chemin

```typescript
function extractRiskSurface(raw: unknown): SurfaceApiResponse | null {
  const obj = raw as Record<string, unknown>;
  
  // Path 1: body.message.message.content.content.risk_surface (actual API)
  try {
    const body = obj?.body as Record<string, unknown>;
    const message1 = body?.message as Record<string, unknown>;
    const message2 = message1?.message as Record<string, unknown>;
    const content1 = message2?.content as Record<string, unknown>;
    const content2 = content1?.content as Record<string, unknown>;
    if (content2?.risk_surface) {
      let surface = content2.risk_surface;
      if (typeof surface === "string") {
        try { surface = JSON.parse(surface); } catch { return null; }
      }
      return surface as SurfaceApiResponse;
    }
  } catch {}
  
  // Legacy fallback...
  return null;
}
```

#### 4. Mettre à jour `extractConfidenceNote` pour le nouveau chemin

Appliquer la même logique de chemin pour `confidence_note`.

#### 5. Mettre à jour `normalizeN8n` pour parser le `final_answer` correctement

Le `final_answer` est un JSON stringifié qui contient les `setups` pour le tab "Trade Setup". Le code actuel essaie de le parser mais ne trouve pas le bon chemin.

```typescript
function normalizeN8n(raw: unknown): N8nTradeResult | null {
  try {
    // Try new path first: body.message.message.content.content.final_answer
    const obj = raw as Record<string, unknown>;
    let finalAnswerStr: string | null = null;
    
    try {
      const body = obj?.body as Record<string, unknown>;
      const message1 = body?.message as Record<string, unknown>;
      const message2 = message1?.message as Record<string, unknown>;
      const content1 = message2?.content as Record<string, unknown>;
      const content2 = content1?.content as Record<string, unknown>;
      if (typeof content2?.final_answer === "string") {
        finalAnswerStr = content2.final_answer;
      }
    } catch {}
    
    if (finalAnswerStr) {
      try {
        const parsed = JSON.parse(finalAnswerStr);
        // parsed contains: instrument, setups, market_commentary_anchor, etc.
        return {
          instrument: parsed.instrument,
          asOf: parsed.asOf,
          market_commentary_anchor: parsed.market_commentary_anchor,
          setups: Array.isArray(parsed.setups) ? parsed.setups : [],
          disclaimer: parsed.disclaimer || "Illustrative ideas, not investment advice.",
        };
      } catch {}
    }
    
    // Fallback to legacy paths...
  } catch {
    return null;
  }
}
```

---

## Structure de Données Attendue (après parsing)

### `final_answer` (stringified JSON) contient:
```json
{
  "instrument": "EUR/USD",
  "asOf": "2026-01-28T22:00:00Z",
  "market_commentary_anchor": {
    "summary": "...",
    "key_drivers": [...]
  },
  "setups": [{
    "horizon": "intraday",
    "direction": "long",
    "entryPrice": 1.1949,
    "stopLoss": 1.1925,
    "takeProfits": [1.1975, 1.1995],
    ...
  }],
  "disclaimer": "..."
}
```

### `trade_setup` (array[0] is stringified JSON) contient:
```json
{
  "status": "success",
  "data": {
    "payload": {
      "horizons": [{
        "h": "12h",
        "direction": "short",
        "entry_price": 1.1923,
        "forecast": { "medianPrice": ..., "p20": ..., "p80": ... },
        ...
      }]
    }
  }
}
```

---

## Fichiers Modifiés

| Fichier | Changements |
|---------|-------------|
| `src/pages/ForecastTradeGenerator.tsx` | Mise à jour des 5 fonctions extracteurs pour utiliser le chemin `body.message.message.content.content.*` |

---

## Garanties

1. **Zero Régression**: Les chemins legacy sont conservés en fallback
2. **Compatibilité**: Le code gère les formats JSON stringifiés dans la réponse
3. **Robustesse**: Try/catch autour des accès aux chemins profonds pour éviter les crashes
4. **Debug Fonctionnel**: Le debug JSON affiche toujours la réponse brute pour diagnostiquer
