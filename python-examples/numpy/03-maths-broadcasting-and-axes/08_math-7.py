# -*- coding: utf-8 -*-
# ==========================================================================
# argmax, cumsum and friends [numpy / Maths, broadcasting and axes]
# ==========================================================================
# WHAT IT IS
# argmax and argmin return the POSITION of the largest and smallest value (not
# the value). cumsum gives running totals, np.diff the differences between
# neighbours. The value itself comes from indexing: a[a.argmax()] equals
# a.max().
#
# WHERE YOU USE IT
# A classifier's predicted class is probs.argmax(axis=1); running totals and
# differences appear in time-series features.
#
# RUN IT:  python 08_math-7.py
#

import numpy as np

a = np.array([3, 9, 2, 7])
print(a.argmax(), a.argmin())
print(a.cumsum())
print(np.diff(a))
probs = np.array([[0.1, 0.7, 0.2], [0.5, 0.3, 0.2]])
print(probs.argmax(axis=1))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1 2
# [ 3 12 14 21]
# [ 6 -7  5]
# [1 0]
