# -*- coding: utf-8 -*-
# ==========================================================================
# Soft margin: the C trade-off and hinge loss [machine-learning / Probability,
# neighbours and margins]
# ==========================================================================
# WHAT IT IS
# Real data is rarely perfectly separable. The standard soft-margin objective
# is ½‖w‖² + C Σ max(0, 1 − yᵢ f(xᵢ)): the first term prefers a wide margin,
# the second (hinge loss) charges for points inside the margin or on the wrong
# side. A larger C punishes violations more (narrower margin, risk of
# overfitting); a smaller C tolerates them (wider margin, more regularised).
# With ½‖w‖² = 0.25 and one Normal point inside the Spam side with loss 1.5,
# the objective is 0.25 + 1.5C. Drag the margin y·f(x).
#
# WHERE YOU USE IT
# Choose C (and the kernel's γ) by validation after scaling. Training loss
# alone always prefers a huge C.
#
# RUN IT:  python 07_classic-6.py
#

import numpy as np

w = np.array([0.5, 0.5]); b = -3.0
X = np.array([[1, 1], [2, 2], [4, 4], [5, 5], [3.5, 3.5]])
y = np.array([-1, -1, 1, 1, -1])
margins = y * (X @ w + b)
hinge = np.maximum(0, 1 - margins)
print(margins.tolist(), hinge.tolist())
for C in (1, 10):
    print(C, 0.5 * float(w @ w) + C * float(hinge.sum()))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [2.0, 1.0, 1.0, 2.0, -0.5] [0.0, 0.0, 0.0, 0.0, 1.5]
# 1 1.75
# 10 15.25
