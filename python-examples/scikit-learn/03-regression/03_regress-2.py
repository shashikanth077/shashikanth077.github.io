# -*- coding: utf-8 -*-
# ==========================================================================
# Regression metrics: MAE, MSE, RMSE and R² [scikit-learn / Regression]
# ==========================================================================
# WHAT IT IS
# A regression score must say how far off the predictions are.
# mean_absolute_error is the average miss in the target's own units.
# mean_squared_error squares each miss, punishing big ones; its square root,
# RMSE, is back in the original units. r2_score compares your model with
# always predicting the mean: 1 is perfect, 0 is no better than the mean,
# below 0 is worse.
#
# WHERE YOU USE IT
# Report an error in real units ("off by 0.5 dollars on average") next to R²
# so non-technical readers can judge it.
#
# RUN IT:  python 03_regress-2.py
#

from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

y_true = [3, 5, 7]
y_pred = [2.5, 5, 8]
mae = mean_absolute_error(y_true, y_pred)
mse = mean_squared_error(y_true, y_pred)
print(round(mae, 3), round(mse, 3), round(mse ** 0.5, 3), round(r2_score(y_true, y_pred), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.5 0.417 0.645 0.844
