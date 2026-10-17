# -*- coding: utf-8 -*-
# ==========================================================================
# Laplace smoothing: no zero probabilities [machine-learning / Probability,
# neighbours and margins]
# ==========================================================================
# WHAT IT IS
# If no Normal email in training had many links, P(high links | Normal) = 0/4
# = 0, and the whole Normal score — a product — becomes 0 whatever the other
# clues say. Laplace smoothing adds α = 1 to every count: (0 + 1)/(4 + 2) =
# 1/6. It makes unseen combinations possible without changing the model's main
# shape. For words, the denominator adds α × vocabulary size.
#
# WHERE YOU USE IT
# Multiplying many small probabilities underflows; real implementations add
# log probabilities instead.
#
# RUN IT:  python 02_classic-1.py
#

import numpy as np

count, rows = 0, 4
print(count / rows, round((count + 1) / (rows + 2), 4))
probs = np.full(400, 0.01)
print(float(np.prod(probs)), round(float(np.log(probs).sum()), 1))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.0 0.1667
# 0.0 -1842.1
