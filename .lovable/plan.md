

# Plan: Corriger l'extraction de `risk_surface` en gérant les strings JSON

## Diagnostic du Problème

L'extraction de `risk_surface` échoue parce que le code ne gère pas le cas où `content.content` est une **string JSON** au lieu d'un objet directement parsé.

### Structure attendue vs structure réelle

**Ce que le code attend :**
```typescript
content2 = content1.content // objet { risk_surface: {...} }
content2.risk_surface // accessible directement
```

**Ce que l'API peut retourner :**
```typescript
content2 = content1.content // STRING: '{"risk_surface": {...}, "trade_setup": [...]}'
content2.risk_surface // undefined car content2 est une string !
```

Le problème est dans la fonction `extractRiskSurface` (et potentiellement dans les autres extracteurs) : elle assume que `content2` est toujours un objet, alors qu'il peut être une string JSON qu'il faut parser.

---

## Solution Technique

### Fichier: `src/pages/ForecastTradeGenerator.tsx`

#### Créer une fonction helper pour parser `content.content`

Cette fonction gèrera les deux cas : objet direct ou string JSON.

```typescript
/**
 * Parse content.content which may be an object or a JSON string
 */
function parseContentContent(content: unknown): Record<string, unknown> | null {
  if (!content) return null;
  
  // Already an object
  if (typeof content === "object" && content !== null) {
    return content as Record<string, unknown>;
  }
  
  // JSON string - parse it
  if (typeof content === "string") {
    try {
      const parsed = JSON.parse(content);
      if (typeof parsed === "object" && parsed !== null) {
        console.log("[parseContentContent] Parsed JSON string successfully");
        return parsed as Record<string, unknown>;
      }
    } catch (e) {
      console.log("[parseContentContent] Failed to parse JSON string:", e);
    }
  }
  
  return null;
}
```

#### Modifier Path 1 de `extractRiskSurface` (lignes 502-518)

Remplacer l'accès direct à `content2` par un parsing conditionnel :

```typescript
// Path 1: body.message.message.content.content.risk_surface (actual API response)
try {
  const body = obj?.body as Record<string, unknown>;
  const message1 = body?.message as Record<string, unknown>;
  const message2 = message1?.message as Record<string, unknown>;
  const content1 = message2?.content as Record<string, unknown>;
  
  // CRITICAL: content2 may be a JSON string, not an object
  const content2 = parseContentContent(content1?.content);
  
  if (content2?.risk_surface) {
    console.log("[extractRiskSurface] Found risk_surface in content.content");
    const result = parseSurface(content2.risk_surface);
    if (result) {
      console.log("[extractRiskSurface] Found via Path 1 (body.message.message.content.content)");
      return result;
    }
  }
} catch (e) {
  console.log("[extractRiskSurface] Path 1 failed:", e);
}
```

#### Appliquer la même logique aux autres extracteurs

Pour la cohérence, modifier également :
- `extractTradeSetup` (Path 1, ligne 372)
- `extractFinalAnswer` (Path 1, ligne 626)
- `extractConfidenceNote` (Path 1, ligne 666)
- `normalizeN8n` (ligne 202)

---

## Détail des Modifications

| Lignes | Composant | Changement |
|--------|-----------|------------|
| ~310 | Nouveau | Ajouter fonction `parseContentContent()` |
| 502-518 | `extractRiskSurface` Path 1 | Utiliser `parseContentContent()` pour parser `content1.content` |
| 366-382 | `extractTradeSetup` Path 1 | Utiliser `parseContentContent()` |
| 620-630 | `extractFinalAnswer` Path 1 | Utiliser `parseContentContent()` |
| 660-670 | `extractConfidenceNote` Path 1 | Utiliser `parseContentContent()` |
| 196-206 | `normalizeN8n` | Utiliser `parseContentContent()` |

---

## Code de Debug Additionnel

Ajouter des logs pour tracer le type de `content2` :

```typescript
console.log("[extractRiskSurface] content1.content type:", typeof content1?.content);
console.log("[extractRiskSurface] content2 keys after parsing:", content2 ? Object.keys(content2) : "null");
```

---

## Garanties Zero Régression

1. **Compatibilité arrière** : Si `content.content` est déjà un objet, `parseContentContent` le retourne tel quel
2. **Parsing robuste** : Try/catch pour gérer les strings mal formées
3. **Logs détaillés** : Traçabilité complète du chemin d'extraction
4. **Même composant** : `RiskSurfaceChart` reste inchangé

---

## Résultat Attendu

1. Le champ `risk_surface` sera correctement extrait, que `content.content` soit un objet ou une string JSON
2. Les données seront aplaties par `parseSurface` (déjà implémenté)
3. La surface 3D s'affichera dans l'onglet "Forecast Data"

