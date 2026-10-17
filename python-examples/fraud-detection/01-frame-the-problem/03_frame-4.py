# -*- coding: utf-8 -*-
# ==========================================================================
# Why accuracy is the wrong score [fraud-detection / Frame the problem]
# ==========================================================================
# WHAT IT IS
# If only 0.2 % of transactions are fraud, a "model" that approves everything
# is 99.8 % accurate — and catches nothing. This is the accuracy paradox of
# imbalanced problems: the metric rewards the majority class. Use measures
# that look at the rare class: recall (of all fraud, how much did we catch?),
# precision (of everything we flagged, how much was fraud?), their combination
# (F-score, PR-AUC), and above all money — the cost of the decisions. Drag the
# fraud rate: the do-nothing model stays "accurate" while catching zero.
#
# WHERE YOU USE IT
# Report recall, precision, alert rate and net savings together; never
# accuracy alone.
#
# RUN IT:  python 03_frame-4.py
#

import numpy as np
rng = np.random.default_rng(0)
y = (rng.random(100_000) < 0.002).astype(int)       # 0.2 % fraud
pred = np.zeros_like(y)                              # "approve everything"
accuracy = (pred == y).mean()
recall = (pred[y == 1] == 1).mean() if y.sum() else 0
print("fraud cases:", int(y.sum()))
print("accuracy of approve-all:", round(float(accuracy), 4))
print("recall of approve-all:", float(recall))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# fraud cases: 176
# accuracy of approve-all: 0.9982
# recall of approve-all: 0.0
