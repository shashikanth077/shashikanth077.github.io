# -*- coding: utf-8 -*-
# ==========================================================================
# The derivative: the slope of the loss right now [neural-networks / Gradient
# descent and backpropagation]
# ==========================================================================
# WHAT IT IS
# Picture walking down a foggy hill: the slope tells you which way is
# downhill. The derivative is that slope. A positive gradient means "decrease
# the parameter"; a negative gradient means "increase it". For x = 3, y = 11,
# bias 2: ŷ = 3w + 2, L = ½(3w − 9)² and the slope is dL/dw = (3w − 9) × 3 —
# the error times the 3 that the weight multiplies. At w = 1 the slope is −18:
# the loss falls steeply as w increases. Drag w: the orange tangent flattens
# as you approach the minimum at w = 3.
#
# WHERE YOU USE IT
# A derivative can be checked numerically: (L(w + h) − L(w − h)) / 2h. This
# "gradient check" is how people debug hand-written backpropagation.
#
# RUN IT:  python 04_learn-3.py
#

loss = lambda w: 0.5 * (3 * w + 2 - 11) ** 2
w, h = 1.0, 1e-5
analytic = (3 * w - 9) * 3
numeric = (loss(w + h) - loss(w - h)) / (2 * h)
print(analytic, round(numeric, 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# -18.0 -18.0
