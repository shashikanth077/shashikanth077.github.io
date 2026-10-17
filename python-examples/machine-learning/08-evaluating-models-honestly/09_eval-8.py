# -*- coding: utf-8 -*-
# ==========================================================================
# Log loss: reward honest probabilities [machine-learning / Evaluating models
# honestly]
# ==========================================================================
# WHAT IT IS
# Hard decisions hide how confident the model was. Log loss per row is −[y ln
# p + (1 − y) ln(1 − p)]: only the probability given to the TRUE class
# matters, and a confident wrong answer is very expensive. A true Spam scored
# 0.8 costs −ln 0.8 = 0.2231; scored 0.1 it costs −ln 0.1 = 2.3026. Four
# examples (0.8, 0.1 for y = 1; 0.2, 0.9 for y = 0) average (0.2231 + 2.3026 +
# 0.2231 + 2.3026)/4 ≈ 1.2629. Lower is better; implementations clip
# probabilities to avoid ln 0.
#
# WHERE YOU USE IT
# For multiclass, use −ln(probability assigned to the true class), with the
# columns in the right class order.
#
# RUN IT:  python 09_eval-8.py
#

import numpy as np

y = np.array([1, 1, 0, 0])
p = np.array([0.8, 0.1, 0.2, 0.9])
row = -(y * np.log(p) + (1 - y) * np.log(1 - p))
print(row.round(4).tolist(), round(float(row.mean()), 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0.2231, 2.3026, 0.2231, 2.3026] 1.2629
