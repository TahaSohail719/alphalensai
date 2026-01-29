

# Plan: Aligner trade_generator avec ForecastPlaygroundTool + Corrections Macro Lab

## Résumé des Demandes

1. **Forecast Summary by Horizon (trade_generator)** : Utiliser exactement la même méthodologie et colonnes que "Suggested TP/SL based on risk appetite" de ForecastPlaygroundTool
2. **Supprimer la carte "AI Market Analysis"** : Uniquement cette carte (lignes 1721-1751), sans régression
3. **Macro Commentary et Trade Section** : Full-width avec rigueur UX
4. **Page /forecast-playground/macro-commentary uniquement** : Attendre la réponse HTTP directe au lieu de l'événement Supabase Realtime

---

## 1. Aligner RiskProfilesPanel avec ForecastPlaygroundTool

### Fichier: `src/pages/ForecastTradeGenerator.tsx`

La version actuelle de `RiskProfilesPanel` (lignes 866-1057) est une version simplifiée. Il faut l'aligner avec la version complète de `ForecastPlaygroundTool.tsx` (lignes 271-586) qui inclut :

**Colonnes manquantes à ajouter :**
- `Prob (eff.)` avec indicateur d'interpolation (✓ / ⚠)
- `SL Base (σ)` - sigma de base avant friction
- `+SL Friction` - colonne conditionnelle avec friction
- `SL Eff. (σ)` - sigma effectif après friction
- `TP Base (σ)` - sigma de base avant friction
- `+TP Friction` - colonne conditionnelle avec friction
- `TP Eff. (σ)` - sigma effectif après friction

**Logique d'interpolation de probabilité** à ajouter :
- Utiliser `interpolateProbability()` sur les niveaux de base (sans friction)
- Afficher indicateur visuel ✓ (interpolé) ou ⚠ (stratégique fallback)
- Tooltip explicatif pour chaque probabilité

**Changements dans le TableHeader et TableBody** pour matcher exactement le layout de ForecastPlaygroundTool.

---

## 2. Supprimer la carte "AI Market Analysis"

### Fichier: `src/pages/ForecastTradeGenerator.tsx`

Supprimer uniquement les lignes 1721-1751 :

```tsx
// SUPPRIMER CE BLOC :
{/* AI Market Analysis Card - Final Answer with Confidence Note */}
{finalAnswer && !loading && (
  <Card className="rounded-xl border shadow-sm">
    ...
  </Card>
)}
```

**Variables associées à nettoyer** (si non utilisées ailleurs) :
- `finalAnswer` state
- `confidenceNote` state  
- La logique d'extraction de `final_answer` dans `handleSubmit`

**Vérification** : S'assurer que ces variables ne sont pas utilisées dans d'autres parties de l'UI avant de les supprimer.

---

## 3. Full-Width UX pour Macro Commentary et Trade Section

### Fichier: `src/pages/ForecastTradeGenerator.tsx`

Actuellement les cartes de résultats sont dans un conteneur avec padding. Modifier le layout pour que :

- La section "Trade Setup" et "Forecast Data" occupent toute la largeur
- Supprimer les marges latérales excessives
- Appliquer une grille responsive cohérente

**Changements CSS** :
- Remplacer `max-w-*` constraints par `w-full`
- Utiliser `container-fluid` pattern
- Appliquer spacing cohérent `gap-6`

---

## 4. Page Macro Commentary : Réponse HTTP Directe

### Fichier: `src/pages/ForecastMacroLab.tsx`

**Problème actuel** (lignes 391-427) : La page écoute Supabase Realtime pour obtenir la réponse, même si la réponse HTTP contient déjà les données.

**Solution** : Modifier `generateAnalysis()` pour :

1. Faire la requête HTTP et attendre la réponse
2. Parser directement le body de la réponse HTTP
3. Extraire le contenu depuis `body.message.message.content.content`
4. NE PAS écouter Supabase Realtime (supprimer le channel subscription)
5. Appeler `handleRealtimeResponse()` directement avec les données HTTP

**Logique de parsing** :

```typescript
// Après fetch réussi
const bodyText = await response.text();
const json = JSON.parse(bodyText);

// Extraction du contenu (chemin profond)
const content = json?.body?.message?.message?.content?.content;
if (content) {
  handleRealtimeResponse({ message: { content: { content } } }, responseJobId);
} else {
  throw new Error("No content found in response");
}
```

**Suppression du code Realtime** :
- Supprimer `supabase.channel()` subscription
- Supprimer les handlers `postgres_changes`
- Garder `createJob()` pour le tracking (optionnel)

---

## Résumé des Fichiers à Modifier

| Fichier | Action |
|---------|--------|
| `src/pages/ForecastTradeGenerator.tsx` | Aligner RiskProfilesPanel, supprimer AI Market Analysis card, full-width layout |
| `src/pages/ForecastMacroLab.tsx` | Basculer vers réponse HTTP directe, supprimer Realtime listener |

---

## Garanties Zero Régression

1. **ForecastPlaygroundTool.tsx** : AUCUNE modification (référence)
2. **Autres pages** : Non impactées (changements isolés)
3. **API calls** : Endpoints inchangés
4. **State management** : Variables nettoyées proprement
5. **Tests manuels recommandés** :
   - Trade Generator : Vérifier que le tableau affiche toutes les colonnes
   - Macro Lab : Vérifier que la réponse s'affiche immédiatement après le fetch HTTP

