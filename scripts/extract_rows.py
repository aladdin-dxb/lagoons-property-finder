# Lagoons Property Finder v1.0 · © 2026 Ahmed Aladdin (أحمد علاء الدين). All rights reserved. See LICENSE.
"""usage: python3 extract_rows.py <saved tool-result .json> out.json
Rebuilds the {sales, rents} object that W.dump() printed between @@BEGIN@@ and @@END@@."""
import json, sys
raw = json.load(open(sys.argv[1]))
txt = raw[0]['text'] if isinstance(raw, list) else raw
try:
    arr = json.loads(txt)
except Exception:
    # output may be cut after @@END@@; keep the part up to the marker
    cut = txt[:txt.index('"@@END@@"')] + '"@@END@@"]'
    arr = json.loads(cut)
b, e = arr.index('@@BEGIN@@'), arr.index('@@END@@')
obj = json.loads(''.join(arr[b + 1:e]))
json.dump(obj, open(sys.argv[2], 'w'))
print('sales', len(obj['sales']), 'rents', len(obj['rents']))
