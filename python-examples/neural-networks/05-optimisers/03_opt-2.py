# -*- coding: utf-8 -*-
# ==========================================================================
# RMSprop: a step size for every parameter [neural-networks / Optimisers]
# ==========================================================================
# WHAT IT IS
# Different parameters can have gradients of very different size. RMSprop
# tracks a moving average of the SQUARED gradients, v ← βv + (1 − β)g², and
# divides each update by its root: w ← w − η g / (√v + ε). A parameter that
# has been receiving large gradients gets a smaller effective step; one with
# tiny gradients gets a larger one. With g = 4, old v = 4 and β = 0.9: new v =
# 0.9 × 4 + 0.1 × 16 = 5.2 and the scaled gradient is 4 / √5.2 = 1.754. Drag g
# and v.
#
# WHERE YOU USE IT
# Squaring keeps negative and positive gradients from cancelling. The benefit
# shows up across many steps and many parameters, not in a single step.
#
# RUN IT:  python 03_opt-2.py
#

import numpy as np

g, v, beta = 4.0, 4.0, 0.9
v_new = beta * v + (1 - beta) * g ** 2
scaled = g / (np.sqrt(v_new) + 1e-8)
print(round(v_new, 2), round(float(scaled), 3), round(float(-0.1 * scaled), 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 5.2 1.754 -0.1754
