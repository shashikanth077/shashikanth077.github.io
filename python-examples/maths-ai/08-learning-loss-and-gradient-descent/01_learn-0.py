# -*- coding: utf-8 -*-
# ==========================================================================
# Loss: measuring how wrong the model is [maths-ai / Learning: loss and
# gradient descent]
# ==========================================================================
# WHAT IT IS
# A loss is a single number for how wrong the predictions are — smaller is
# better. Mean squared error squares each error then averages: it punishes big
# misses heavily. Mean absolute error averages the sizes of the errors: it is
# gentler with outliers. Pick the loss that matches what you care about.
#
# WHERE YOU USE IT
# Regression models usually minimise MSE (or MAE if outliers abound);
# classification uses cross-entropy.
#
# RUN IT:  python 01_learn-0.py
#

actual = [10, 20, 30]
pred = [12, 18, 33]
mse = sum((a - p) ** 2 for a, p in zip(actual, pred)) / 3
mae = sum(abs(a - p) for a, p in zip(actual, pred)) / 3
print(round(mse, 3), round(mae, 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 5.667 2.333
