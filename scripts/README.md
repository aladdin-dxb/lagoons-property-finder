# Update kit

Lagoons Property Finder v1.0 · © 2026 Ahmed Aladdin (أحمد علاء الدين). See LICENSE.

1. `dxb_helpers.js`: paste into the console (or Claude in Chrome's javascript tool) on https://dxbinteract.com/dubai-house-prices
   - `W.start(from, to)` runs all 12 phases for that date range (sales and leases).
   - Poll `W.out.done` and `W.out.log`. A `hit cap` warning means: rerun that period in smaller windows.
   - Get the results with `W.copy()` (DevTools: copies to clipboard) or `W.dump()` (Claude: output saved to a tool-result file).
2. `extract_rows.py` (only after `W.dump()`): `python3 scripts/extract_rows.py <saved tool-result .json> new_rows.json`
3. `merge.py`: `python3 scripts/merge.py data/data.json new_rows.json YYYY-MM-DD`
   Safe to rerun; it skips deals and leases already in the file.

Row formats in `new_rows.json`:
- sales: `phase|unit|price|plot|bua|YYYY-MM-DD|D/I|R/O|beds` (D developer, I individual; R ready, O off-plan)
- rents: `phase|unit|rent|plot|start|end|months|beds`
