
# Plan: Afficher le champ "content" avec StyledJsonViewer dans Macro Commentary

## Analyse du Problème

Actuellement dans la page `/forecast-playground/macro-commentary` :

1. Le **HTTP Debug panel** affiche le JSON brut complet via `StyledJsonViewer` ✓
2. Le **contenu extrait** depuis `body.message.message.content.content` est converti en string puis affiché en texte brut avec `whitespace-pre-wrap`
3. Le problème : si `content` est un objet JSON structuré, il est affiché comme une chaîne de caractères au lieu d'utiliser le visualiseur JSON premium

## Solution Technique

### Fichier: `src/pages/ForecastMacroLab.tsx`

#### 1. Modifier le type de `AnalysisSection.content` pour accepter JSON

Changer le type de `string` à `string | object` pour permettre le stockage d'objets JSON :

```typescript
interface AnalysisSection {
  title: string;
  content: string | object;  // Modifié pour accepter JSON
  type: "overview" | "technical" | "fundamental" | "outlook";
  expanded: boolean;
}
```

#### 2. Modifier `handleRealtimeResponse` pour conserver le format original

Au lieu de toujours convertir en string, garder l'objet JSON si c'est un objet :

```typescript
// Dans handleRealtimeResponse (vers ligne 180-186)
if (Array.isArray(responsePayload) && responsePayload.length > 0) {
  const deepContent = (responsePayload as any)[0]?.message?.message?.content?.content;
  // Garder l'objet original au lieu de convertir en string
  analysisContent = deepContent;
} else if (responsePayload?.message?.content?.content) {
  analysisContent = responsePayload.message.content.content;
} else {
  analysisContent = responsePayload;
}
```

#### 3. Modifier le rendu des sections pour utiliser `StyledJsonViewer`

Remplacer l'affichage texte par un rendu conditionnel (vers lignes 778-780) :

```typescript
<CollapsibleContent className="animate-accordion-down">
  <div className="bg-muted/20 p-4 rounded-lg border">
    {typeof section.content === "object" ? (
      <StyledJsonViewer data={section.content} initialExpanded={true} maxDepth={4} />
    ) : (
      <div className="whitespace-pre-wrap text-foreground text-sm leading-relaxed">
        {section.content}
      </div>
    )}
  </div>
</CollapsibleContent>
```

---

## Résumé des Modifications

| Ligne(s) | Changement |
|----------|------------|
| ~47 | Modifier `AnalysisSection.content` : `string` → `string \| object` |
| ~151-187 | Modifier `handleRealtimeResponse` pour conserver le format JSON |
| ~778-780 | Affichage conditionnel : `StyledJsonViewer` si objet, texte sinon |

---

## Garanties Zero Régression

1. **Fallback texte** : Si le contenu est une string, l'affichage texte actuel est conservé
2. **Autres pages** : Cette modification est isolée à `ForecastMacroLab.tsx`
3. **HTTP Debug** : Inchangé (fonctionne déjà avec `StyledJsonViewer`)
4. **Copie** : La fonction de copie continuera à fonctionner (conversion en string si besoin)
