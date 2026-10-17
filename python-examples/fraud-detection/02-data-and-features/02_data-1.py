# -*- coding: utf-8 -*-
# ==========================================================================
# A simulator you can run: transactions with hidden fraud [fraud-detection /
# Data and features]
# ==========================================================================
# WHAT IT IS
# Real card data is private, so this track generates its own. The simulator
# creates 150 cards over 30 days: each card has a home location, three
# favourite merchant categories and a steady stream of normal purchases. It
# also adds genuine trips (a cardholder really is far from home) and 14
# compromised cards, each hit by a burst of high-value purchases — some far
# away, some near home so the signal is not trivial. Every row carries the
# true label. Because everything is seeded, the numbers printed by later
# examples are exact and repeatable, and because genuine odd behaviour
# overlaps with fraud, no model here reaches a perfect score — just like real
# life.
#
# WHERE YOU USE IT
# A simulator is also how teams test fraud systems safely: replay it through
# the pipeline, inject new attack patterns, and check detection and latency
# before real money is on the line.
#
# RUN IT:  python 02_data-1.py
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
print("transactions:", len(rows), "| fraud:", int(y.sum()), f"({y.mean() * 100:.2f}%)")
print("feature names: log_amount, amount_z, velocity_10min, log_speed, new_category")
print("mean feature | fraud :", X[y == 1].mean(0).round(2))
print("mean feature | legit :", X[y == 0].mean(0).round(2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# transactions: 6861 | fraud: 78 (1.14%)
# feature names: log_amount, amount_z, velocity_10min, log_speed, new_category
# mean feature | fraud : [4.45 2.1  0.97 7.2  0.33]
# mean feature | legit : [3.35 0.04 0.01 0.88 0.05]
