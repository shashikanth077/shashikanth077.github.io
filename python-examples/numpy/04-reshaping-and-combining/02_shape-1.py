# -*- coding: utf-8 -*-
# ==========================================================================
# flatten versus ravel [numpy / Reshaping and combining]
# ==========================================================================
# WHAT IT IS
# Both turn a multi-dimensional array into 1D. flatten() always returns a
# COPY. ravel() returns a VIEW when it can (no copying, faster) — so changing
# the raveled array may change the original. When independence matters, use
# flatten or .copy().
#
# WHERE YOU USE IT
# Knowing which operations share memory prevents bugs where "preprocessing"
# silently modifies the raw data.
#
# RUN IT:  python 02_shape-1.py
#

import numpy as np

b = np.arange(1, 7).reshape(2, 3)
f = b.flatten()
f[0] = 99
print(b[0, 0])
r = b.ravel()
r[0] = 99
print(b[0, 0])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1
# 99
