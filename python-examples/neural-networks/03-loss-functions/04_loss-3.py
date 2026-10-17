# -*- coding: utf-8 -*-
# ==========================================================================
# Categorical cross-entropy [neural-networks / Loss functions]
# ==========================================================================
# WHAT IT IS
# For one example among several mutually exclusive classes: CCE = −Σ yₖ ln pₖ.
# With a one-hot target only the true class has yₖ = 1, so the sum collapses
# to −ln(probability given to the true class). A ticket scored Billing 2,
# Technical 1, Delivery 0 gets softmax probabilities 0.665, 0.245, 0.090; if
# the truth is Billing the loss is −ln 0.665 = 0.408; if it were Delivery, −ln
# 0.090 = 2.408. Raising the true class's score lowers the loss; the other
# classes only matter through the softmax normalisation. Choose the true class
# and drag the scores.
#
# WHERE YOU USE IT
# In PyTorch, CrossEntropyLoss expects raw logits, not softmax output; it
# applies a stable log-softmax internally.
#
# RUN IT:  python 04_loss-3.py
#

import numpy as np

z = np.array([2.0, 1.0, 0.0])
p = np.exp(z) / np.exp(z).sum()
print(p.round(3).tolist())
for true in range(3):
    print(true, round(float(-np.log(p[true])), 3))
print(round(float(-np.log(0.2)), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0.665, 0.245, 0.09]
# 0 0.408
# 1 1.408
# 2 2.408
# 1.609
