# -*- coding: utf-8 -*-
# ==========================================================================
# Dropout: practising with random absences [neural-networks / Overfitting and
# regularization]
# ==========================================================================
# WHAT IT IS
# During training, dropout hides each hidden activation with probability p, so
# neurons cannot lean on one another (like a medical team that must cope when
# specialists are missing). To keep the average signal unchanged, the
# survivors are scaled up — inverted dropout: keep probability q = 1 − p,
# output = mask × activation / q. For p = 0.25, q = 0.75 and a surviving
# activation is multiplied by 1/0.75 ≈ 1.333. In evaluation mode dropout is
# switched OFF. The expected value matches across many masks, but a single
# pass need not.
#
# WHERE YOU USE IT
# Keras: Dropout(0.3) is active in model.fit and inactive in model.predict.
# Forgetting to switch to evaluation mode is a classic bug.
#
# RUN IT:  python 05_fit-4.py
#

import numpy as np

rng = np.random.default_rng(0)
a = np.array([1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0])
p = 0.25
q = 1 - p
mask = rng.random(a.size) < q
print(mask.astype(int).tolist(), round(1 / q, 3))
print((mask * a / q).round(2).tolist())
means = [float((((rng.random(a.size) < q) * a) / q).sum()) for _ in range(20000)]
print(round(float(np.mean(means)), 2), float(a.sum()))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [1, 1, 1, 1, 0, 0, 1, 1] 1.333
# [1.33, 2.67, 4.0, 5.33, 0.0, 0.0, 9.33, 10.67]
# 36.03 36.0
