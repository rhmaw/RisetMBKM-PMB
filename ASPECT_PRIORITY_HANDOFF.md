# Handoff: Aspect & Priority (UI prototype)

## Status

This page is a **visual prototype only**. The figures and examples under `src/data/aspectPriorityDemoData.js` are mock data copied/adapted from the supplied HTML design. Do not cite these values as research results or operational findings. No ABSA model, Firestore, Firebase Auth, intervention-ticket backend, or live aspect data is connected here.

## Files to know

- `src/pages/AspectPriority.jsx`: React page, current filters, matrix, table, details drawer, demo CSV download, and placeholder dialogs.
- `src/pages/AspectPriority.css`: styles scoped to the Aspect & Priority page (`ap-*` class names).
- `src/data/aspectPriorityDemoData.js`: all visible mock data for table/matrix/detail drawer and the example multi-aspect extraction. This is the easiest starting point for replacing demo content.

## Data contract suggested for later integration

The current UI row shape is:

```js
{
  id: "cost-info",                 // stable ID/key
  aspect: "Informasi Biaya & Pembayaran",
  shortName: "Info Biaya & Pembayaran",
  total: 3820,
  positive: 1420,
  neutral: 932,
  negative: 1468,
  negativeRate: 38.4,               // percentage from 0 to 100
  priorityScore: 84.2,              // agreed, validated formula
  status: "Prioritas Tinggi",
  source: "Instagram Resmi PMB",
  period: "2026/2027",
  frequencyX: 95,                   // current visual plot position, 0–100
  negativeY: 23,                    // current visual plot position, 0–100
  urgency: "Prioritas 1 (Kuadran I)",
  urgencyColor: "high",
  rootCauses: [{ title: "...", count: 12 }],
  recommendation: "..."
}
```

The extraction preview shape is:

```js
{
  rawComment: "...",
  source: "...",
  date: "...",
  aspects: [{
    name: "Informasi Biaya Kuliah",
    sentiment: "Negatif",           // Positif | Netral | Negatif
    entity: "text span / evidence",
    confidence: 0.89                 // 0–1
  }]
}
```

These are UI contracts, not claims about the final model. Adjust them to the output that the teammate's ABSA pipeline actually produces. Do not show confidence or evaluation scores unless the model supplies them and the team has decided how they are calibrated.

## Recommended integration path

1. Agree on the aspect taxonomy and labeled annotation schema before training/evaluating.
2. Add a service/adapter that converts model/API output into the UI row/extraction shapes above. Keep model inference out of the React presentation component.
3. Replace `aspectDemoRows` and `aspectDemoExtraction` with API/Firestore state; provide explicit loading, empty, and error states.
4. Define and document the priority-score formula and quadrant thresholds, then calculate them from validated data rather than copying example coordinates.
5. Add model version, evaluation split, macro-F1/precision/recall, timestamp, and confidence/calibration information only when they are available.
6. Connect the CSV export and action/ticket flow to actual data/backend. The current CSV download is explicitly named `aspect-priority-data-contoh.csv`.

## Important

The page's period/source/aspect filters and details drawer are working against local mock data only. Date-range filter is currently a UI selection placeholder because these aggregate demo rows do not contain per-comment timestamps. The dashboard's overall sentiment dataset and this aspect page are intentionally not connected.
