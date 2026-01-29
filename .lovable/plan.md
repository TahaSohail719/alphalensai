

# Plan: Ajouter des logs de debug pour diagnostiquer la structure de `risk_surface`

## Problème Actuel

Les logs montrent :
```
[extractRiskSurface] Found risk_surface in content.content!
[handleSubmit] risk_surface details: { hasSurface: false, source: "fallback_from_trade_setup" }
```

Le champ `risk_surface` **EST trouvé**, mais `parseSurface()` retourne `null` et le système utilise le fallback. Cela signifie que la structure réelle de `risk_surface` ne correspond à aucun format supporté.

## Cause Probable

La fonction `parseSurface` vérifie 3 formats :
1. `s.surface.surface.target_probs` (doublement imbriqué)
2. `s.surface.target_probs` (simplement imbriqué)  
3. `s.target_probs` (propriétés directes)

Mais aucun ne matche → le `risk_surface` de l'API a probablement une 4ème structure non gérée.

---

## Solution: Ajouter des logs détaillés

### Fichier: `src/pages/ForecastTradeGenerator.tsx`

#### Modification ligne 545-546

Ajouter un log pour afficher le contenu de `risk_surface` AVANT d'appeler `parseSurface` :

```typescript
if (content2?.risk_surface) {
  console.log("[extractRiskSurface] Found risk_surface in content.content!");
  // NEW: Log the actual structure to diagnose why parseSurface fails
  console.log("[extractRiskSurface] risk_surface type:", typeof content2.risk_surface);
  console.log("[extractRiskSurface] risk_surface keys:", 
    typeof content2.risk_surface === "object" && content2.risk_surface !== null 
      ? Object.keys(content2.risk_surface as object) 
      : "N/A"
  );
  console.log("[extractRiskSurface] risk_surface sample:", JSON.stringify(content2.risk_surface, null, 2).slice(0, 500));
  
  const result = parseSurface(content2.risk_surface);
  // ...
}
```

#### Modification dans `parseSurface` (lignes 485-530)

Ajouter des logs à chaque étape de validation :

```typescript
const s = parsed as Record<string, unknown>;
console.log("[parseSurface] Checking structure, keys:", Object.keys(s));

if (s?.surface && typeof s.surface === "object") {
  const outerSurface = s.surface as Record<string, unknown>;
  console.log("[parseSurface] Found s.surface, keys:", Object.keys(outerSurface));
  
  if (outerSurface?.surface && typeof outerSurface.surface === "object") {
    const innerSurface = outerSurface.surface as Record<string, unknown>;
    console.log("[parseSurface] Found s.surface.surface, keys:", Object.keys(innerSurface));
    // ... rest
  }
}
```

---

## Résumé

| Ligne | Changement |
|-------|------------|
| 545-546 | Log du type, des clés et d'un échantillon de `risk_surface` |
| 485-530 | Logs à chaque étape de validation dans `parseSurface` |

## Résultat Attendu

Après cette modification, les logs de la console afficheront :
- La structure exacte de `risk_surface` reçu de l'API
- Le chemin où la validation échoue dans `parseSurface`

Cela permettra d'identifier précisément quel format l'API utilise et d'adapter `parseSurface` en conséquence.

