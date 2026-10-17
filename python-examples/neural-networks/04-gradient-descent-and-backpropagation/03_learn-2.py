# -*- coding: utf-8 -*-
# ==========================================================================
# Loss as a U-shaped curve [neural-networks / Gradient descent and
# backpropagation]
# ==========================================================================
# WHAT IT IS
# To tell how wrong a prediction is we use half squared error L = ½(ŷ − y)².
# The ½ cancels the 2 that appears when we differentiate; squaring makes
# under- and over-predictions both costly. For the 3 km trip (actual 11):
# predicting 5 gives error −6 and L = ½ × 36 = 18; predicting 11 gives 0. Plot
# L against the prediction and you get a U: the bottom is the right answer,
# and training means sliding down the U.
#
# WHERE YOU USE IT
# Squared error is a teaching choice for regression; classification uses
# cross-entropy.
#
# RUN IT:  python 03_learn-2.py
#

import numpy as np

for pred in (5, 8, 11, 14):
    err = pred - 11
    print(pred, err, 0.5 * err ** 2)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 5 -6 18.0
# 8 -3 4.5
# 11 0 0.0
# 14 3 4.5
