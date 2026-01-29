

# Plan: Debug HTTP Premium - Style Institutionnel AlphaLens

## Objectif

Transformer l'affichage debug HTTP d'un simple texte coloré vers une interface de grade professionnel alignée avec le design system AlphaLens (cards avec gradients, badges, bordures colorées, organisation visuelle structurée).

---

## Analyse du Style AlphaLens Existant

Le site utilise un design "Institutional Grade" caractérisé par:

- **Cards avec gradients subtils**: `bg-gradient-to-r from-card via-card to-muted/30`
- **Badges indicateurs**: petites cartes avec icônes, labels uppercase, valeurs en `font-mono`
- **Bordures colorées sémantiques**: `border-primary/20`, `border-emerald-500/20`, `border-amber-500/20`
- **Effets hover**: transitions `hover:bg-primary/10 hover:border-primary/30`
- **Ombres douces**: `shadow-soft`, `shadow-sm`, `ring-1 ring-primary/20`
- **Structure hiérarchique**: Headers avec icônes dans conteneurs arrondis `p-2 rounded-lg bg-primary/10`

---

## Nouveau Design du JSON Viewer

### 1. Conteneur Principal (JSON Debug Panel)

```text
┌────────────────────────────────────────────────────────────────────┐
│  ┌────┐  HTTP Response                                    [Copy]  │
│  │ {} │  Macro Lab Proxy • 200 OK • 1.2s                          │
│  └────┘                                                            │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ┌─ Request ─────────────────────────────────────────────────────┐ │
│  │  ▸ headers    Object(3)                                       │ │
│  │  ▸ body       Object(5)                                       │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌─ Response ────────────────────────────────────────────────────┐ │
│  │  ┌ statusCode ─────────────────────────────────────┐          │ │
│  │  │ 200                                    [number] │          │ │
│  │  └─────────────────────────────────────────────────┘          │ │
│  │                                                               │ │
│  │  ▾ body                                      Object(2)        │ │
│  │    │                                                          │ │
│  │    ├── message ─────────────────────────────────────────────┤ │ │
│  │    │   ┌ status ────────────────────────────────┐           │ │ │
│  │    │   │ "done"                        [string] │           │ │ │
│  │    │   └────────────────────────────────────────┘           │ │ │
│  │    │                                                        │ │ │
│  │    └── ▸ content                          Object(3)         │ │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

### 2. Composants Visuels Clés

**A. Noeud Primitif (string/number/boolean/null)**
- Affichage dans une mini-card avec bordure colorée à gauche
- Badge type sur la droite `[string]`, `[number]`, etc.
- Background subtil selon le type

```tsx
<div className="flex items-center justify-between p-2 rounded-md bg-muted/30 border-l-2 border-emerald-500/50">
  <span className="font-mono text-sm text-emerald-600">"value"</span>
  <Badge variant="outline" className="text-[10px] px-1.5 text-muted-foreground">string</Badge>
</div>
```

**B. Noeud Object/Array (Collapsible)**
- Header cliquable avec chevron animé
- Badge count: `Object(5)` ou `Array(3)`
- Ligne verticale de connexion pour l'indentation
- Background léger au hover

```tsx
<div className="group">
  <button className="flex items-center gap-2 w-full p-2 rounded-md hover:bg-muted/50 transition-colors">
    <ChevronRight className={cn("h-4 w-4 transition-transform", expanded && "rotate-90")} />
    <span className="font-medium text-primary">"keyName"</span>
    <Badge variant="outline" className="ml-auto text-xs">Object(5)</Badge>
  </button>
  {expanded && (
    <div className="ml-4 pl-4 border-l-2 border-border/50 space-y-1">
      {/* Children nodes */}
    </div>
  )}
</div>
```

**C. Palette de Couleurs par Type**

| Type | Bordure gauche | Texte | Badge |
|------|----------------|-------|-------|
| String | `border-emerald-500/50` | `text-emerald-600` | string |
| Number | `border-amber-500/50` | `text-amber-600` | number |
| Boolean | `border-sky-500/50` | `text-sky-600` | boolean |
| Null | `border-slate-400/50` | `text-slate-500 italic` | null |
| Object | `border-violet-500/50` | `text-primary` | Object(n) |
| Array | `border-blue-500/50` | `text-blue-600` | Array(n) |

---

## Modifications Techniques

### Fichier: `src/components/ui/styled-json-viewer.tsx`

Refonte complète du composant avec:

1. **Interface enrichie**:
```typescript
interface StyledJsonViewerProps {
  data: unknown;
  depth?: number;
  initialExpanded?: boolean;
  maxDepth?: number;           // Limite d'expansion auto
  showTypeLabels?: boolean;    // Afficher les badges de type
  compactMode?: boolean;       // Mode condensé pour petits conteneurs
}
```

2. **Composants internes modulaires**:
- `JsonPrimitive` - Pour string/number/boolean/null
- `JsonObject` - Pour les objets avec collapse
- `JsonArray` - Pour les tableaux avec collapse
- `JsonKey` - Pour les clés avec style primary

3. **Nouveaux éléments visuels**:
- Mini-cards pour chaque valeur primitive
- Badges de type alignés à droite
- Bordure gauche colorée selon le type
- Animation rotate sur les chevrons
- Ligne verticale pour l'indentation (tree line)
- Hover states avec `bg-muted/50`

4. **Amélioration UX**:
- Troncature intelligente des longues strings avec tooltip
- Bouton "Expand All" / "Collapse All" en header
- Compteur d'éléments pour objets/arrays
- Support du copier-coller par noeud

---

### Fichiers Modifiés

| Fichier | Changements |
|---------|-------------|
| `src/components/ui/styled-json-viewer.tsx` | Refonte complète avec design AlphaLens premium |
| `src/pages/ForecastMacroLab.tsx` | Ajustement du conteneur (déjà utilise le composant) |
| `src/pages/ForecastTradeGenerator.tsx` | Ajustement du conteneur (déjà utilise le composant) |

---

## Rendu Visuel Attendu

### Avant (Texte brut coloré)
```
"statusCode": 200
▸ Object(2)
  "message": "done"
  ▸ body Object(3)
```

### Après (Cards structurées style AlphaLens)
```text
┌──────────────────────────────────────────┐
│ ● statusCode                    [number] │
│   200                                    │
└──────────────────────────────────────────┘

┌ message ─────────────────────────────────┐
│ ▾  body                       Object(3)  │
│    │                                     │
│    ├── ● status                 [string] │
│    │   "done"                            │
│    │                                     │
│    └── ▸ content               Object(4) │
└──────────────────────────────────────────┘
```

---

## Garanties

1. **Zero Régression**: Fallback texte brut si JSON invalide
2. **Performance**: Lazy rendering avec virtualisation pour gros objets
3. **Cohérence**: Style aligné avec RiskSurfaceChart, TradeSetupDisplay, BacktesterSummary
4. **Responsive**: Adapté mobile avec mode compact
5. **Accessibilité**: Navigation clavier supportée

