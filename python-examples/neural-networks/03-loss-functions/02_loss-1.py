# -*- coding: utf-8 -*-
# ==========================================================================
# Mean squared error (regression) [neural-networks / Loss functions]
# ==========================================================================
# WHAT IT IS
# MSE = (1/n) Σ (yᵢ − ŷᵢ)². Subtract to get the error, square it (so over- and
# under-predictions both count and big mistakes count much more), add them up
# and divide by n. Three deliveries: actual 20, 30, 40 minutes; predicted 18,
# 25, 44: errors 2, 5, −4, squares 4, 25, 16, MSE = 45/3 = 15 minutes². The
# units are squared; RMSE = √MSE = 3.87 minutes is back in minutes and MAE
# (mean absolute error) = 3.67 is more robust to outliers. Drag the
# prediction: the loss is a parabola with its minimum at the true value.
#
# WHERE YOU USE IT
# MSE is sensitive to outliers. If large errors are unusually frequent,
# compare MAE or Huber loss.
#
# RUN IT:  python 02_loss-1.py
#

import numpy as np

y = np.array([20.0, 30.0, 40.0])
pred = np.array([18.0, 25.0, 44.0])
err = y - pred
print(err.tolist(), (err ** 2).tolist())
mse = float((err ** 2).mean())
print(mse, round(mse ** 0.5, 2), round(float(np.abs(err).mean()), 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [2.0, 5.0, -4.0] [4.0, 25.0, 16.0]
# 15.0 3.87 3.67
