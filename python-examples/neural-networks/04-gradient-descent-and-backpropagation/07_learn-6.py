# -*- coding: utf-8 -*-
# ==========================================================================
# Learning rate: the size of each step [neural-networks / Gradient descent and
# backpropagation]
# ==========================================================================
# WHAT IT IS
# The learning rate sets how far each update moves. Too small: safe but slow.
# Too large: you jump across the valley and the loss grows. For the
# one-example loss L(w) = ½(3w − 9)² the update is w_new − 3 = (1 − 9η)(w −
# 3): the distance to the best weight is multiplied by (1 − 9η) every step, so
# it shrinks only if |1 − 9η| < 1, i.e. 0 < η < 2/9 ≈ 0.222. (A bound specific
# to this toy curve — it does not carry over to every network.) Between 1/9
# and 2/9 the iterate oscillates but still converges. Drag η.
#
# WHERE YOU USE IT
# A negative gradient is not a negative loss: it only tells you which way to
# move. The learning rate does not change where the best answer is, only how
# you get there.
#
# RUN IT:  python 07_learn-6.py
#

for lr in (0.02, 0.1, 0.2, 0.25):
    w = 1.0
    for step in range(10):
        w -= lr * 9 * (w - 3)
    print(lr, round(w, 4), round(0.5 * (3 * w - 9) ** 2, 6))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.02 2.7251 0.340055
# 0.1 3.0 0.0
# 0.2 2.7853 0.207526
# 0.25 -15.6265 1561.251128
