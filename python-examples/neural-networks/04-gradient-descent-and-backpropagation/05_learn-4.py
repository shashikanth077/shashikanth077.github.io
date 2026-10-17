# -*- coding: utf-8 -*-
# ==========================================================================
# The chain rule: follow the effect backwards [neural-networks / Gradient
# descent and backpropagation]
# ==========================================================================
# WHAT IT IS
# A weight does not touch the loss directly: it changes the prediction, and
# the prediction changes the loss. The chain rule multiplies the two slopes:
# dL/dw = (dL/dŷ) × (dŷ/dw). For w = 1, b = 2, x = 3, y = 11: forward ŷ = 5, L
# = 18. dL/dŷ = ŷ − y = −6; dŷ/dw = x = 3; dŷ/db = 1. So dL/dw = −6 × 3 = −18
# and dL/db = −6. With learning rate 0.05: w = 1 − 0.05 × (−18) = 1.9 and b =
# 2 − 0.05 × (−6) = 2.3. The new prediction is 1.9 × 3 + 2.3 = 8.0 and the
# loss falls from 18 to 4.5.
#
# WHERE YOU USE IT
# PyTorch and TensorFlow do this automatically (autograd); you still need the
# idea to interpret training problems.
#
# RUN IT:  python 05_learn-4.py
#

w, b, x, y, lr = 1.0, 2.0, 3.0, 11.0, 0.05
pred = w * x + b
loss = 0.5 * (pred - y) ** 2
dL_dpred = pred - y
dw, db = dL_dpred * x, dL_dpred * 1
print(pred, loss, dL_dpred, dw, db)
w2, b2 = w - lr * dw, b - lr * db
print(round(w2, 2), round(b2, 2), round(w2 * x + b2, 2), round(0.5 * (w2 * x + b2 - y) ** 2, 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 5.0 18.0 -6.0 -18.0 -6.0
# 1.9 2.3 8.0 4.5
