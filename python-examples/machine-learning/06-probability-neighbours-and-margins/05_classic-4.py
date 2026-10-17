# -*- coding: utf-8 -*-
# ==========================================================================
# kNN details: k, weights and scaling [machine-learning / Probability,
# neighbours and margins]
# ==========================================================================
# WHAT IT IS
# Small k follows noisy neighbours; large k smooths away small groups; an odd
# k avoids many binary ties (not every tie). Instead of one vote each you can
# weight neighbours by 1/d so closer ones count more. Example: nearest labels
# [Normal, Spam, Spam] at distances 1, 2, 2.5: uniform voting says Spam (2 to
# 1); distance-weighted gives Normal 1.0 versus Spam 0.5 + 0.4 = 0.9 → Normal.
# The two rules can disagree. Zero-distance matches need special handling, and
# features must be scaled.
#
# WHERE YOU USE IT
# Choose k, the distance and the weighting together with cross-validation.
# Prediction cost grows with the training set because every query searches all
# points.
#
# RUN IT:  python 05_classic-4.py
#

import numpy as np

labels = ["Normal", "Spam", "Spam"]
d = np.array([1.0, 2.0, 2.5])
uniform = {"Normal": 1, "Spam": 2}
w = 1 / d
weighted = {"Normal": float(w[0]), "Spam": float(w[1] + w[2])}
print(uniform)
print({k: round(v, 2) for k, v in weighted.items()})

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# {'Normal': 1, 'Spam': 2}
# {'Normal': 1.0, 'Spam': 0.9}
