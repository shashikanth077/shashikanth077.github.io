# -*- coding: utf-8 -*-
# ==========================================================================
# Sorting and argsort [numpy / Maths, broadcasting and axes]
# ==========================================================================
# WHAT IT IS
# np.sort(a) returns a sorted copy; a.sort() sorts in place. np.argsort(a)
# returns the positions that WOULD sort the array — handy for ranking, because
# you can use them to reorder another array. Reverse with [::-1].
#
# WHERE YOU USE IT
# Ranking predictions by confidence, finding the top-k nearest neighbours and
# ordering labels by score are all argsort.
#
# RUN IT:  python 09_math-8.py
#

import numpy as np

scores = np.array([30, 10, 20])
print(np.sort(scores))
print(np.argsort(scores))
print(scores[np.argsort(scores)[::-1]])
top2 = np.argsort(scores)[::-1][:2]
print(top2)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [10 20 30]
# [1 2 0]
# [30 20 10]
# [0 2]
