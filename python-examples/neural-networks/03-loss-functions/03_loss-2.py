# -*- coding: utf-8 -*-
# ==========================================================================
# Binary cross-entropy [neural-networks / Loss functions]
# ==========================================================================
# WHAT IT IS
# For a yes/no target with predicted probability p (from a sigmoid): L = −[y
# ln p + (1 − y) ln(1 − p)]. If y = 1 it reduces to −ln p; if y = 0 to −ln(1 −
# p). Student passed (y = 1): p = 0.99 → 0.010 (very good), 0.80 → 0.223, 0.50
# → 0.693 (uncertain), 0.20 → 1.609, 0.01 → 4.605 (confidently wrong). The
# logarithm makes a confident wrong answer expensive. In fraud screening with
# y = 1 and p = 0.9 the loss is 0.105; at p = 0.01 it is 4.605. Choose the
# truth and drag p.
#
# WHERE YOU USE IT
# For binary classification the final logit goes through a sigmoid; libraries
# offer BCE-with-logits, which fuses the two for numerical stability.
#
# RUN IT:  python 03_loss-2.py
#

import numpy as np

for p in (0.99, 0.80, 0.50, 0.20, 0.01):
    print(p, round(float(-np.log(p)), 3))
print(round(float(-np.log(1 - 0.99)), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.99 0.01
# 0.8 0.223
# 0.5 0.693
# 0.2 1.609
# 0.01 4.605
# 4.605
