# -*- coding: utf-8 -*-
# ==========================================================================
# Logistic regression on text features [nlp / Sentiment and text
# classification]
# ==========================================================================
# WHAT IT IS
# Instead of modelling how words are generated, logistic regression learns
# weights directly: p(positive) = σ(w·x + b) where x are TF-IDF or count
# features. Words with positive weights ("great", "loved") push the score up,
# negative ones ("awful") push it down — so the weights are interpretable.
# Trained by gradient descent on cross-entropy with L2 regularization to avoid
# memorising rare words. With the weights learned by the toy model below,
# "great loved" gets p = 0.98 while "boring awful" gets 0.02.
#
# WHERE YOU USE IT
# Inspect the largest weights after training: surprising words reveal leakage
# or dataset artefacts.
#
# RUN IT:  python 03_cls-2.py
#

import numpy as np

vocab = ["great", "loved", "boring", "awful", "movie"]
docs = ["great movie", "loved movie", "boring movie", "awful movie", "great loved", "boring awful"]
y = np.array([1, 1, 0, 0, 1, 0])
X = np.array([[d.split().count(w) for w in vocab] for d in docs], float)
w, b = np.zeros(len(vocab)), 0.0
for _ in range(500):
    p = 1 / (1 + np.exp(-(X @ w + b)))
    w -= 0.5 * (X.T @ (p - y) / len(y) + 0.01 * w)
    b -= 0.5 * (p - y).mean()
print({v: round(float(x), 2) for v, x in zip(vocab, w)})
f = lambda s: round(float(1 / (1 + np.exp(-(np.array([s.split().count(v) for v in vocab]) @ w + b)))), 2)
print(f("great loved"), f("boring awful"))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# {'great': 2.09, 'loved': 2.09, 'boring': -2.09, 'awful': -2.09, 'movie': -0.0}
# 0.98 0.02
