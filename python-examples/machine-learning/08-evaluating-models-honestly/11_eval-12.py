# -*- coding: utf-8 -*-
# ==========================================================================
# Regression metrics: MAE, MSE, RMSE, R² [machine-learning / Evaluating models
# honestly]
# ==========================================================================
# WHAT IT IS
# For a numeric target, compare predictions with the truth in the target's own
# units. MAE = mean |error|; MSE = mean error² (punishes large misses); RMSE =
# √MSE; R² = 1 − Σerror² / Σ(y − ȳ)², the share of variance explained (1
# perfect, 0 no better than predicting the mean, negative worse). For truths
# 3, 5, 7 and predictions 2.5, 5, 8: errors −0.5, 0, +1 → MAE 0.5, MSE 0.4167,
# RMSE 0.6455, R² = 1 − 1.25/8 = 0.84375.
#
# WHERE YOU USE IT
# Report an error in real units next to R² so non-technical readers can judge
# it.
#
# RUN IT:  python 11_eval-12.py
#

import numpy as np

y = np.array([3.0, 5.0, 7.0])
pred = np.array([2.5, 5.0, 8.0])
err = pred - y
mse = float((err ** 2).mean())
r2 = 1 - float((err ** 2).sum() / ((y - y.mean()) ** 2).sum())
print(round(float(np.abs(err).mean()), 4), round(mse, 4), round(mse ** 0.5, 4), round(r2, 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.5 0.4167 0.6455 0.8438
