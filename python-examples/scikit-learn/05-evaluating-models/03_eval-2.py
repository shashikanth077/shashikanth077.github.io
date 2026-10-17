# -*- coding: utf-8 -*-
# ==========================================================================
# The threshold trades precision for recall [scikit-learn / Evaluating models]
# ==========================================================================
# WHAT IT IS
# A classifier outputs scores; a threshold turns them into decisions. Raise it
# and you flag fewer cases: precision rises, recall falls. Lower it and you
# catch more real cases but also more false alarms. The right threshold is a
# business choice, not a modelling one. Below, ten cases with scores are
# classified at your threshold.
#
# WHERE YOU USE IT
# Set the threshold from the costs (a missed fraud case versus a wasted
# review) and the review capacity of your team.
#
# RUN IT:  python 03_eval-2.py
#

import numpy as np
from sklearn.metrics import precision_score, recall_score

scores = np.array([0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.05])
y = np.array([1, 1, 0, 1, 0, 1, 0, 0, 0, 0])
for t in (0.75, 0.55, 0.35):
    pred = (scores >= t).astype(int)
    print(t, round(precision_score(y, pred), 2), round(recall_score(y, pred), 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.75 1.0 0.5
# 0.55 0.75 0.75
# 0.35 0.67 1.0
