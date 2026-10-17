# -*- coding: utf-8 -*-
# ==========================================================================
# Backpropagation versus the optimiser: SGD [neural-networks / Optimisers]
# ==========================================================================
# WHAT IT IS
# Backpropagation computes gradients; the optimiser decides how to use them.
# The simplest is gradient descent: w ← w − η · gradient. "Stochastic" (SGD)
# strictly means one random example per step; in practice SGD means mini-batch
# gradients. Example: loss ½(w − 2)², start at w = −4: the gradient is w − 2 =
# −6 and with η = 0.2 the next weight is −4 − 0.2 × (−6) = −2.8. Each step
# closes a fraction η of the gap to w = 2. Drag η: small is slow, 1 jumps
# straight to the answer, above 1 overshoots further each time and diverges.
#
# WHERE YOU USE IT
# With momentum, SGD makes faster progress along consistent directions and is
# a strong choice, especially for convolutional networks.
#
# RUN IT:  python 01_opt-0.py
#

w, lr = -4.0, 0.2
path = [w]
for step in range(5):
    w -= lr * (w - 2)
    path.append(round(w, 3))
print(path)
print(-4 - 0.2 * (-4 - 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [-4.0, -2.8, -1.84, -1.072, -0.458, 0.034]
# -2.8
