# -*- coding: utf-8 -*-
# ==========================================================================
# A threshold turns a score into a class [neural-networks / Measuring
# performance]
# ==========================================================================
# WHAT IT IS
# A model outputs a score; the class comes from a rule: predict positive if
# score ≥ τ. Lowering τ makes more examples positive: recall cannot fall,
# false alarms may rise. Raising τ does the opposite. Twelve digit-five scores
# (six real fives, six others) show it: τ = 0.25 gives TP = 6, FP = 2
# (precision 75%, recall 100%); τ = 0.50 gives TP = 4, FP = 1 (80%, 66.7%); τ
# = 0.70 gives TP = 3, FP = 0 (100%, 50%). Pick τ on validation data and
# costs, freeze it, then evaluate once on the test set.
#
# WHERE YOU USE IT
# The threshold changes the decision, not the model's scores; 0.5 is a
# default, not a law.
#
# RUN IT:  python 05_metrics-4.py
#

import numpy as np

pos = np.array([0.95, 0.88, 0.75, 0.6, 0.4, 0.3])
neg = np.array([0.55, 0.35, 0.2, 0.12, 0.08, 0.05])
for tau in (0.25, 0.5, 0.7):
    tp = int((pos >= tau).sum())
    fp = int((neg >= tau).sum())
    print(tau, tp, fp, round(tp / (tp + fp), 3), round(tp / 6, 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.25 6 2 0.75 1.0
# 0.5 4 1 0.8 0.667
# 0.7 3 0 1.0 0.5
