# Lagoons Property Finder v1.0 · © 2026 Ahmed Aladdin (أحمد علاء الدين). All rights reserved. See LICENSE.
"""Weekly merge of new DXBinteract rows into the Lagoons Property Finder data/data.json.

usage: python3 merge.py data.json new_rows.json RUN_DATE(YYYY-MM-DD)
new_rows.json = {"sales": ["phase|unit|price|plot|bua|YYYY-MM-DD|D/I|R/O|beds", ...],
                 "rents": ["phase|unit|rent|plot|start|end|months|beds", ...]}
Writes data.json in place and prints a summary.
"""
import json, re, sys, collections

data_path, rows_path, run_date = sys.argv[1], sys.argv[2], sys.argv[3]
D = json.load(open(data_path))
NEW = json.load(open(rows_path))
C = D['C']

PREF = {'J': 'cb', 'K': 'cb', 'BL': 'pf', 'DL': 'pf', 'V': 'ven', 'W': 'ven', 'M': 'nice', 'L': 'nice',
        'Q': 'mal', 'P': 'mal', 'X': 'mor', 'Y': 'mor2', 'S': 'mc', 'T': 'ibz', 'R': 'mar', 'U': 'myk'}
for ch in 'ABCDEFGH':
    PREF[ch] = 'san'
PHASE_OK = {'cb': 'Costa Brava', 'pf': 'Portofino', 'san': 'Santorini', 'ven': 'Venice', 'nice': 'Nice',
            'mal': 'Malta', 'mor': 'Morocco 1', 'mor2': 'Morocco 2', 'mc': 'Monte Carlo', 'ibz': 'Ibiza',
            'mar': 'Marbella', 'myk': 'Mykonos'}
MULTI = {'cb', 'nice', 'mal', 'ven', 'san'}


def where(phase, code):
    m = re.match(r'^([A-Z]+)(\d+)$', code)
    if not m:
        return None, None
    p, n = m.group(1), m.group(2)
    cid = PREF.get(p)
    if not cid or PHASE_OK[cid] not in phase:
        return None, None
    key = code if cid in MULTI else str(int(n))
    if cid == 'cb':
        key = p + str(int(n))
    return cid, key


def to_int(x):
    try:
        return int(x)
    except Exception:
        return None


def type_for(cid, plot, bua, beds, dev):
    keys = {str(r['k']) for r in C[cid].get('tsum') or []}
    tk = None
    if cid == 'ven':
        if dev:
            tk = 'A' if dev < 7.5e6 else 'B' if dev < 12.6e6 else 'C' if dev < 19e6 else 'D'
        elif plot:
            tk = 'A' if plot < 6500 else 'B' if plot < 10000 else 'C'
    elif bua:
        if bua <= 3500:
            pos = 'M' if (plot or 1550) < 2000 else 'E'
            b = beds or {2208: '4', 2861: '5', 3164: '5'}.get(bua)
            tk = f'{b}{pos}'
            if cid == 'nice' and bua == 3164:
                tk = '5E'
        else:
            tk = f'V{bua}'
    elif plot:
        tk = '4M' if plot < 2000 else '5E' if plot < 4000 else 'V'
    return tk if tk in keys else None


rep = collections.defaultdict(lambda: collections.Counter())
unmapped = []
first_ready = {}

for line in NEW.get('sales', []):
    f = line.split('|')
    if len(f) < 9:
        continue
    phase, code, v, plot, bua, d, k, rdy, beds = f[:9]
    v, plot, bua = to_int(v), to_int(plot), to_int(bua)
    cid, key = where(phase, code)
    if not cid:
        unmapped.append(line); continue
    if rdy == 'R':
        first_ready[phase] = min(first_ready.get(phase, d), d)
    U = C[cid]['units']
    u = U.get(key)
    if cid == 'cb':
        if u is None:
            u = U[key] = {'t': None, 'z': None, 'bua': bua, 'plot': plot, 'S': [], 'R': [], 'xy': None}
            rep[cid]['new units'] += 1
        u.setdefault('S', [])
        if [k, v, d] not in u['S']:
            u['S'].append([k, v, d]); u['S'].sort(key=lambda x: x[2]); rep[cid]['new sales'] += 1
        continue
    if u is None or 'd' not in u:
        old = u or {}
        u = U[key] = {**old, 'ph': phase, 'plot': plot, 'bua': bua, 'd': []}
        if cid != 'pf':
            u['t'] = type_for(cid, plot, bua, beds or None, v if k == 'D' else None)
        rep[cid]['new units'] += 1
        if u.get('t') is None and cid != 'pf':
            rep[cid]['new units without type'] += 1
    if not u.get('plot') and plot:
        u['plot'] = plot
    if not u.get('bua') and bua:
        u['bua'] = bua
    exists = any(x[0] == d and x[1] == v and x[2] == k for x in u['d'])
    if not exists:
        row = [d, v, k] + ([plot] if plot and plot != u.get('plot') else [])
        if cid == 'pf':
            row = [d, v, k, plot]
        u['d'].append(row); u['d'].sort(key=lambda x: x[0]); rep[cid]['new sales'] += 1

for line in NEW.get('rents', []):
    f = line.split('|')
    if len(f) < 8:
        continue
    phase, code, rent, plot, s, e, months, beds = f[:8]
    rent, months, plot = to_int(rent), to_int(months), to_int(plot)
    cid, key = where(phase, code)
    if not cid:
        unmapped.append(line); continue
    U = C[cid]['units']
    u = U.get(key)
    if cid == 'cb':
        if u is None:
            u = U[key] = {'t': None, 'z': None, 'bua': None, 'plot': plot, 'S': [], 'R': [], 'xy': None}
        u.setdefault('R', [])
        # Costa Brava keeps one annualised rent per unit per month
        ann = round(rent * 12 / months) if months else rent
        if not any(x[1] == s[:7] for x in u['R']):
            u['R'].append([ann, s[:7]]); rep[cid]['new leases'] += 1
        continue
    if u is None:
        u = U[key] = {'ph': phase, 'plot': plot, 'bua': None, 'd': [], 't': None}
        rep[cid]['new units'] += 1
    u.setdefault('r', [])
    if not any(x[0] == s and x[3] == rent and x[2] == months for x in u['r']):
        u['r'].append([s, e, months, rent]); u['r'].sort(key=lambda x: x[0]); rep[cid]['new leases'] += 1

# handover: a phase still marked "not handed over" that now shows Ready sales flips to handed over
ho_flips = []
for cid, c in C.items():
    for h in c.get('ho') or []:
        if h.get('s') == 'wip':
            for ph, d in first_ready.items():
                if ph.startswith(h['p']):
                    h.clear(); h.update({'p': ph, 's': 'done', 'd': d[:7], 'auto': True})
                    ho_flips.append(f'{ph} {d}')

D.setdefault('SNAP', {})
for cid in PHASE_OK:
    D['SNAP'][cid] = run_date
D['updated'] = run_date
json.dump(D, open(data_path, 'w'), ensure_ascii=False, separators=(',', ':'))

print('RUN', run_date, '| sales rows', len(NEW.get('sales', [])), '| lease rows', len(NEW.get('rents', [])))
for cid in PHASE_OK:
    if rep[cid]:
        print(' ', cid, dict(rep[cid]))
if not any(rep.values()):
    print('  no new deals or leases')
if ho_flips:
    print('  handover detected:', ', '.join(ho_flips))
if unmapped:
    print('  unmapped rows:', len(unmapped), unmapped[:5])
