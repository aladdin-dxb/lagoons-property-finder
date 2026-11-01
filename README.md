# Lagoons Property Finder

**Find any unit in DAMAC Lagoons: its type, its place on the plan, its DLD sales and Ejari leases, and a price and rent range for 3, 6 or 12 months.** English, العربية and 中文, with PDF reports.

By **Ahmed Aladdin | أحمد علاء الدين** · Instagram [@aladdin.therealtor](https://www.instagram.com/aladdin.therealtor)

---

## What it does

- **Master plan of all 12 phases:** Costa Brava 1 & 2, Portofino, Marbella, Mykonos, Ibiza, Monte Carlo, Malta, Nice, Venice, Santorini, Morocco 1 and 2.
- **Unit search:** type a unit number (R414, U575, K438, BL917) to see its type, built-up area, plot, position on the plan and full history.
- **Unit types from DLD data** (built-up area, bedrooms, plot), not from plan colours.
- **Price and rent ranges** (lower quartile, median, upper quartile) for the last 3, 6 or 12 months or a custom period, with the number of deals behind each range.
- **Actual handover** per phase, from the DLD register.
- **PDF reports** for the master plan, a phase, a unit type or a single unit.

## What is in this repository

| Folder | Contents |
|---|---|
| `index.html` | The tool |
| `config/agent.js` | Your name and contact details, shown next to the credit |
| `data/data.json` | Structure only: units, types and positions. **No transactions** |
| `plans/` | Empty. Add your own plan images (list in `plans/README.md`) |
| `scripts/` | Update kit to pull sales and leases from DXBinteract |

Transaction data and plan images belong to their owners (DLD, DXBinteract, DAMAC, Property Monitor), so they are not shared here. You build your own copy.

## Set up

1. Download this repository (Code > Download ZIP) and unzip it.
2. Fill `config/agent.js` with your name, company and phone.
3. Add the plan images to `plans/` (names and sizes in `plans/README.md`).
4. Build your data (next section).
5. Open the tool through a local server, because browsers block `data.json` when you double-click the file:
   ```
   cd lagoons-property-finder
   python3 -m http.server 8000
   ```
   then open http://localhost:8000

## Build your data

You need a logged-in [DXBinteract](https://dxbinteract.com) account in Chrome.

1. Open https://dxbinteract.com/dubai-house-prices
2. Open the DevTools console (F12 > Console) and paste the whole of `scripts/dxb_helpers.js`.
3. Run one window, for example a quarter:
   ```
   W.start('2024-01-01','2024-03-31')
   ```
   Wait until `W.out.done` is `true` (check `W.out.log`). If a line says `hit cap`, run that period again in smaller windows (one month).
4. Run `W.copy()` and paste the clipboard into a file called `new_rows.json`.
5. Merge it:
   ```
   python3 scripts/merge.py data/data.json new_rows.json 2026-11-01
   ```
6. Repeat for each window from the first sales (2021) to today. After that, one run a week keeps it current.

The merge never duplicates a deal, so running a window twice is safe.

**With Claude:** if you use Claude with Claude in Chrome, ask it to follow `scripts/README.md`; it can run the windows, save the output with `W.dump()` and merge it for you.

## Credit and license

The tool and every PDF it makes show this line, and it must stay:

> Lagoons Property Finder v1.0 © 2026 Ahmed Aladdin | أحمد علاء الدين · @aladdin.therealtor

You can add your own name and contact details next to it (`config/agent.js`). Free to use for yourself and your clients; not for resale. Full terms in [LICENSE](LICENSE). For commercial licensing, contact [@aladdin.therealtor](https://www.instagram.com/aladdin.therealtor).

Figures are estimates built from public records, not financial advice.

---

## بالعربي

**Lagoons Property Finder** أداة لداماك لاجونز: اكتب رقم أي وحدة يطلعلك نوعها ومكانها على المخطط وصفقاتها في DLD وعقود الإيجار، ورنج السعر والإيجار لآخر 3 أو 6 أو 12 شهر، وتقدر تطلّع تقرير PDF بالعربي أو الإنجليزي أو الصيني.

الريبو فيه الأداة وتصنيف الوحدات ومكانها على المخططات، **من غير صفقات ومن غير صور المخططات**. كل بروكر بيسحب الداتا بحسابه على DXBinteract بالسكربتات اللي في `scripts/` ويحط صور المخططات في `plans/`.

اسمك وبياناتك بتتكتب في `config/agent.js` وبتظهر جنب سطر الكريديت، والسطر ده لازم يفضل في الأداة وفي كل تقرير.

إعداد: **أحمد علاء الدين | Ahmed Aladdin** · [@aladdin.therealtor](https://www.instagram.com/aladdin.therealtor)
