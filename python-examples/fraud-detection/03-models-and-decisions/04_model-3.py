# -*- coding: utf-8 -*-
# ==========================================================================
# Boosted trees: the workhorse for tabular fraud data [fraud-detection /
# Models and decisions]
# ==========================================================================
# WHAT IT IS
# On rows of mixed numeric and categorical features — exactly fraud data —
# gradient-boosted decision trees (XGBoost, LightGBM, CatBoost) are usually
# the strongest practical model. The idea: build many tiny trees one after
# another; each new tree is trained to fix the errors left by the trees so
# far, and its output is added with a small learning rate. They handle
# non-linear effects and interactions ("big amount AND new device"), need
# little feature scaling, cope with missing values, and score in microseconds.
# The code shows the principle with one-split trees ("stumps") on eight
# points: after three rounds the predictions move towards the labels.
#
# WHERE YOU USE IT
# Gradient boosting is the default production model for card fraud; keep
# logistic regression as the explainable baseline and for monitoring.
#
# RUN IT:  python 04_model-3.py
#

import numpy as np
x = np.array([1, 2, 3, 4, 5, 6, 7, 8.0])           # one feature: purchase size
y = np.array([0, 0, 0, 0, 1, 1, 0, 1.0])            # fraud mostly at large sizes
pred = np.full(len(x), y.mean())                    # start from the base rate
learning_rate = 0.5
print("start      ", pred.round(2))
for round_no in (1, 2, 3):
    resid = y - pred                                 # what the model still gets wrong
    best = None
    for thr in (x[:-1] + x[1:]) / 2:                 # try every split point
        left, right = resid[x <= thr], resid[x > thr]
        err = ((left - left.mean()) ** 2).sum() + ((right - right.mean()) ** 2).sum()
        if best is None or err < best[0]:
            best = (err, thr, left.mean(), right.mean())
    _, thr, left_val, right_val = best
    pred = pred + learning_rate * np.where(x <= thr, left_val, right_val)
    print(f"round {round_no} split at {thr:.1f} ->", pred.round(2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# start       [0.38 0.38 0.38 0.38 0.38 0.38 0.38 0.38]
# round 1 split at 4.5 -> [0.19 0.19 0.19 0.19 0.56 0.56 0.56 0.56]
# round 2 split at 4.5 -> [0.09 0.09 0.09 0.09 0.66 0.66 0.66 0.66]
# round 3 split at 7.5 -> [0.07 0.07 0.07 0.07 0.63 0.63 0.63 0.83]
