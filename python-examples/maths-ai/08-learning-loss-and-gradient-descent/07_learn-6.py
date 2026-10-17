# -*- coding: utf-8 -*-
# ==========================================================================
# Regularisation: L1 and L2 [maths-ai / Learning: loss and gradient descent]
# ==========================================================================
# WHAT IT IS
# A model can fit noise by growing huge weights. Regularisation adds a penalty
# on the weights to the loss so it prefers simpler solutions. L2 adds λ·w² and
# shrinks weights smoothly toward 0; L1 adds λ·|w| and can push some weights
# exactly to 0. λ sets how strong the pull is.
#
# WHERE YOU USE IT
# Weight decay (L2) is applied to almost every neural network; L1 is used when
# you want a sparse model.
#
# RUN IT:  python 07_learn-6.py
#

for lam in [0, 0.5, 1, 4]:
    w_star = 3 / (1 + lam)
    print(lam, round(w_star, 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0 3.0
# 0.5 2.0
# 1 1.5
# 4 0.6
