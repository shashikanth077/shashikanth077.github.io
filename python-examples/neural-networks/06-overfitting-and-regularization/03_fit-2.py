# -*- coding: utf-8 -*-
# ==========================================================================
# Weight decay: what L2 does to a weight [neural-networks / Overfitting and
# regularization]
# ==========================================================================
# WHAT IT IS
# Add L2 to the loss and the gradient picks up an extra 2λw. Each update
# becomes w ← w − η(g + 2λw) = w(1 − 2ηλ) − ηg: the weight is first multiplied
# by a number slightly below 1 ("decay") and then moved by the data gradient.
# Starting from w = 2 with no data gradient, η = 0.1 and λ = 0.5, the factor
# is 0.9 and the weight goes 2 → 1.8 → 1.62 → 1.458…: it fades towards zero
# unless the data keep pushing back.
#
# WHERE YOU USE IT
# With plain SGD, L2 and weight decay coincide; with adaptive optimisers like
# Adam they are not identical, so libraries offer a separate decoupled weight
# decay.
#
# RUN IT:  python 03_fit-2.py
#

w, lr, lam = 2.0, 0.1, 0.5
path = [w]
for _ in range(5):
    w = w - lr * (0 + 2 * lam * w)
    path.append(round(w, 4))
print(path, 1 - 2 * lr * lam)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [2.0, 1.8, 1.62, 1.458, 1.3122, 1.181] 0.9
