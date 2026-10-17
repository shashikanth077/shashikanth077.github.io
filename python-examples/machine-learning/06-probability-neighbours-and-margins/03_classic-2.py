# -*- coding: utf-8 -*-
# ==========================================================================
# Which Naive Bayes? Bernoulli, multinomial, Gaussian [machine-learning /
# Probability, neighbours and margins]
# ==========================================================================
# WHAT IT IS
# Match the likelihood to the feature type. Bernoulli: yes/no presence ("does
# 'offer' appear?"). Multinomial: counts of events such as words. Gaussian:
# continuous numbers modelled by a bell curve per class. Multinomial example:
# spam counts [offer 3, free 2, meeting 0, project 0], Normal [0, 0, 3, 2];
# with α = 1 each denominator is 5 + 4 = 9, and for "offer free": Spam 0.5 ×
# 4/9 × 3/9, Normal 0.5 × 1/9 × 1/9 → P(Spam) = 12/13 ≈ 0.9231. Gaussian:
# density f(x) = exp(−(x−μ)²/2σ²)/(σ√2π); at x = 1 with means 0 and 3, σ = 1
# the densities are 0.24197 and 0.05399, so Normal ≈ 0.8176.
#
# WHERE YOU USE IT
# Multinomial NB expects non-negative values, so z-scoring its input breaks
# it. A density is not the probability of one exact value.
#
# RUN IT:  python 03_classic-2.py
#

import numpy as np

vocab = 4
spam_counts, normal_counts = np.array([3, 2, 0, 0]), np.array([0, 0, 3, 2])
p = lambda c, i: (c[i] + 1) / (c.sum() + vocab)
spam = 0.5 * p(spam_counts, 0) * p(spam_counts, 1)
normal = 0.5 * p(normal_counts, 0) * p(normal_counts, 1)
print(round(spam / (spam + normal), 4))
pdf = lambda x, m, s: np.exp(-(x - m) ** 2 / (2 * s * s)) / (s * np.sqrt(2 * np.pi))
fn, fs = pdf(1, 0, 1), pdf(1, 3, 1)
print(round(float(fn), 5), round(float(fs), 5), round(float(fn / (fn + fs)), 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.9231
# 0.24197 0.05399 0.8176
