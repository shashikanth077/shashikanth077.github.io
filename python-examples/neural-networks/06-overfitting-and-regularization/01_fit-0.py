# -*- coding: utf-8 -*-
# ==========================================================================
# Underfitting, good fit and overfitting [neural-networks / Overfitting and
# regularization]
# ==========================================================================
# WHAT IT IS
# A network is judged on new examples, not on the ones it trained on.
# Underfitting: the model is too simple, so training AND validation error are
# both high. Good fit: it captures the real trend. Overfitting: it reproduces
# training noise — training error keeps falling while validation error rises.
# Think of a student who memorised 100 practice answers but fails an
# unfamiliar question. Delivery times are noisy (traffic lights, weather), so
# a curve that threads every training dot will miss on a brand-new trip.
#
# WHERE YOU USE IT
# A complicated curve is not automatically better. Ask: would it also predict
# a brand-new delivery correctly?
#
# RUN IT:  python 01_fit-0.py
#

import numpy as np

rng = np.random.default_rng(1)
x = np.linspace(0, 1, 12)
y = 3 * x + rng.normal(0, 0.15, 12)
xv = np.linspace(0.04, 0.96, 12)
yv = 3 * xv + rng.normal(0, 0.15, 12)
for degree in (0, 1, 9):
    coef = np.polyfit(x, y, degree)
    mse = lambda a, b: float(np.mean((np.polyval(coef, a) - b) ** 2))
    print(degree, round(mse(x, y), 4), round(mse(xv, yv), 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0 0.8982 0.8525
# 1 0.0077 0.0099
# 9 0.0028 0.0187
