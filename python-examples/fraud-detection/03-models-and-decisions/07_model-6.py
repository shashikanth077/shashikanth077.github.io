# -*- coding: utf-8 -*-
# ==========================================================================
# Choosing the threshold by cost [fraud-detection / Models and decisions]
# ==========================================================================
# WHAT IT IS
# A model outputs a score; a threshold turns it into an action. Pick it by
# money, not by habit: for each possible threshold compute missed fraud × cost
# of a miss + false alarms × cost of an alarm (plus review costs) on matured,
# held-out data, and choose the cheapest (with a miss costing 80 and a block
# 12, the run shows the cheapest threshold is a low 0.2 — missing fraud hurts
# far more than a wrong block). A cheap miss and an expensive customer-block
# push the threshold up; a costly fraud pushes it down. The optimum also moves
# when the fraud rate or the model quality changes, so revisit it regularly,
# and often set different thresholds per segment (new accounts, high-value
# baskets, risky merchants). In the graph the legit scores sit around 0 and
# fraud scores around the separation you choose; drag the threshold to find
# the cheapest point.
#
# WHERE YOU USE IT
# Thresholds are a business setting: log who changed them and why, version
# them like code, and simulate a change on recent data before applying it.
#
# RUN IT:  python 07_model-6.py
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

def standardise(X, cut):
    """Scale every feature with the mean and spread of the TRAINING rows only."""
    mu, sd = X[:cut].mean(0), X[:cut].std(0) + 1e-9
    return (X - mu) / sd

def fit_logreg(Z, y, pos_weight=1.0, lr=0.3, steps=800):
    w, b = np.zeros(Z.shape[1]), 0.0
    sw = np.where(y == 1, pos_weight, 1.0)
    for _ in range(steps):
        p = 1 / (1 + np.exp(-(Z @ w + b)))
        g = (p - y) * sw
        w -= lr * (Z.T @ g) / len(y)
        b -= lr * g.mean()
    return w, b

def predict(Z, w, b):
    return 1 / (1 + np.exp(-(Z @ w + b)))

def average_precision(y, s):
    order = np.argsort(-s)
    hit = y[order]
    prec = np.cumsum(hit) / np.arange(1, len(y) + 1)
    return float((prec * hit).sum() / hit.sum())

def roc_auc(y, s):
    ranks = np.empty(len(s)); ranks[np.argsort(s)] = np.arange(1, len(s) + 1)
    n1 = y.sum(); n0 = len(y) - n1
    return float((ranks[y == 1].sum() - n1 * (n1 + 1) / 2) / (n1 * n0))

rows = make_data()
X, y = featurize(rows)
cut = int(len(y) * 0.7)
Z = standardise(X, cut)
w, b = fit_logreg(Z[:cut], y[:cut], pos_weight=10)
p, yt = predict(Z[cut:], w, b), y[cut:]
COST_MISS, COST_BLOCK = 80.0, 12.0
best = None
print(f"{'threshold':>9}{'blocked':>9}{'caught':>8}{'false':>7}{'cost':>9}")
for t in (0.05, 0.1, 0.2, 0.4, 0.6, 0.8, 0.9, 0.95):
    block = p >= t
    caught = int((block & (yt == 1)).sum())
    false_blocks = int((block & (yt == 0)).sum())
    cost = (yt.sum() - caught) * COST_MISS + false_blocks * COST_BLOCK
    best = min(best or (cost, t), (cost, t))
    print(f"{t:>9.2f}{int(block.sum()):>9}{caught:>8}{false_blocks:>7}{cost:>9.0f}")
print("cheapest threshold:", best[1], "cost", round(best[0]))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# threshold  blocked  caught  false     cost
#      0.05      127      27    100     1360
#      0.10       82      25     57     1004
#      0.20       57      25     32      704
#      0.40       38      22     16      752
#      0.60       30      20     10      840
#      0.80       23      17      6     1032
#      0.90       20      16      4     1088
#      0.95       16      14      2     1224
# cheapest threshold: 0.2 cost 704
