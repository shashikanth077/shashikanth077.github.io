/**
 * Shared Python used by the fraud track examples: a seeded transaction simulator and a few
 * from-scratch helpers (NumPy only). Each example that needs them includes the text, so every
 * example runs on its own.
 */
export const SIM = `
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
`;

export const TOOLS = `
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
`;
