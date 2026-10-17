# -*- coding: utf-8 -*-
# ==========================================================================
# Rules: fast, clear and brittle [fraud-detection / Models and decisions]
# ==========================================================================
# WHAT IT IS
# Every fraud system starts with rules: "decline if the implied speed exceeds
# 900 km/h", "review if five purchases happen in ten minutes". Rules are
# instant, transparent (you can say exactly why a payment was blocked), easy
# to change the same day a new attack appears, and required for things a model
# should never decide alone (sanctions lists, hard limits). Their weakness:
# each rule is a blunt yes/no that ignores context; they multiply into
# hundreds that overlap and contradict; fraudsters probe them and step just
# below the threshold; and nobody remembers why rule 217 exists. Measure each
# rule by the frauds it catches and the good customers it hits, and retire the
# ones that no longer earn their keep.
#
# WHERE YOU USE IT
# Keep a rule registry with an owner, a reason, a date and the live hit and
# precision numbers; review it every quarter.
#
# RUN IT:  python 01_model-0.py
#

import numpy as np

def make_data(seed=7, n_cards=150, days=30):
    """Synthetic card transactions in time order: (time_s, card, amount, category, lat, lon, is_fraud)."""
    rng = np.random.default_rng(seed)
    rows = []
    home = {c: (rng.uniform(35, 55), rng.uniform(-5, 20)) for c in range(n_cards)}
    usual = {c: rng.choice(8, 3, replace=False) for c in range(n_cards)}
    for c in range(n_cards):
        for t in np.sort(rng.uniform(0, days * 86400, rng.poisson(45))):
            amt = rng.lognormal(3.3, 0.7)
            cat = int(rng.choice(usual[c])) if rng.random() < 0.9 else int(rng.integers(0, 8))
            rows.append((t, c, amt, cat, home[c][0] + rng.normal(0, .05), home[c][1] + rng.normal(0, .05), 0))
        if rng.random() < 0.25:                      # a genuine trip: far away, a few normal purchases
            t0 = rng.uniform(0, days * 86400)
            for k in range(int(rng.integers(3, 7))):
                rows.append((t0 + k * rng.uniform(3600, 20000), c, rng.lognormal(3.6, 0.8), int(rng.integers(0, 8)),
                             home[c][0] + 12, home[c][1] + 25, 0))
    for c in rng.choice(n_cards, 14, replace=False):  # compromised cards: a burst of purchases
        t0 = rng.uniform(2 * 86400, (days - 1) * 86400)
        far = rng.random() < 0.6                      # 40 % of attacks happen near home
        for k in range(int(rng.integers(4, 9))):
            rows.append((t0 + k * rng.uniform(30, 600), c, rng.lognormal(4.6 if far else 4.3, 0.6), int(rng.integers(0, 8)),
                         home[c][0] + (rng.uniform(8, 20) if far else rng.normal(0, .05)),
                         home[c][1] + (rng.uniform(15, 40) if far else rng.normal(0, .05)), 1))
    rows.sort(key=lambda r: r[0])
    return rows

def km(la1, lo1, la2, lo2):
    p = np.pi / 180
    a = np.sin((la2 - la1) * p / 2) ** 2 + np.cos(la1 * p) * np.cos(la2 * p) * np.sin((lo2 - lo1) * p / 2) ** 2
    return 12742 * np.arcsin(np.sqrt(a))

def featurize(rows):
    """One feature row per transaction, using only what was known BEFORE it (point-in-time)."""
    hist, X, y = {}, [], []
    for (t, c, amt, cat, la, lo, fr) in rows:
        h = hist.setdefault(c, {"amts": [], "ts": [], "cats": set(), "last": None})
        n = len(h["amts"])
        mean = np.mean(h["amts"]) if n else amt
        sd = np.std(h["amts"]) + 1e-6 if n > 2 else max(amt * 0.5, 1.0)
        vel10 = sum(1 for s in h["ts"][-8:] if t - s <= 600)
        if h["last"]:
            d = km(h["last"][1], h["last"][2], la, lo)
            hours = max((t - h["last"][0]) / 3600, 1 / 60)
        else:
            d, hours = 0.0, 1.0
        X.append([np.log1p(amt), (amt - mean) / sd, vel10, np.log1p(d / hours), float(cat not in h["cats"] and n > 5)])
        y.append(fr)
        h["amts"].append(amt); h["ts"].append(t); h["cats"].add(cat); h["last"] = (t, la, lo)
    return np.array(X), np.array(y)

rows = make_data()
X, y = featurize(rows)
speed = np.expm1(X[:, 3])          # implied km/h
amount = np.expm1(X[:, 0])
rules = {
    "3+ purchases in last 10 min": X[:, 2] >= 3,
    "implied speed > 900 km/h": speed > 900,
    "amount > 150": amount > 150,
}
rules["any rule fires"] = rules["3+ purchases in last 10 min"] | rules["implied speed > 900 km/h"] | rules["amount > 150"]
print(f"{'rule':<30}{'flagged':>8}{'fraud hit':>10}{'precision':>10}{'recall':>8}")
for name, hit in rules.items():
    n, tp = int(hit.sum()), int((hit & (y == 1)).sum())
    print(f"{name:<30}{n:>8}{tp:>10}{tp / max(n, 1):>10.2f}{tp / y.sum():>8.2f}")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# rule                           flagged fraud hit precision  recall
# 3+ purchases in last 10 min          6         6      1.00    0.08
# implied speed > 900 km/h            79        45      0.57    0.58
# amount > 150                        64        10      0.16    0.13
# any rule fires                     135        48      0.36    0.62
