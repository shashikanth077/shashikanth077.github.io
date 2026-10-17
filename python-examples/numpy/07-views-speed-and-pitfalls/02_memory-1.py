# -*- coding: utf-8 -*-
# ==========================================================================
# Why vectorisation is fast [numpy / Views, speed and pitfalls]
# ==========================================================================
# WHAT IT IS
# A Python loop runs one interpreted step per element. A NumPy operation hands
# the whole array to compiled code that walks a contiguous block of memory.
# The result is the same, just much quicker on big arrays — often by one to
# two orders of magnitude. Always benchmark with %timeit rather than assuming.
#
# WHERE YOU USE IT
# Training on millions of values is only feasible because every step is a
# vectorised array operation.
#
# RUN IT:  python 02_memory-1.py
#

import numpy as np

data = list(range(1000))
looped = [v * 2 for v in data]
arr = np.arange(1000)
vector = arr * 2
print(np.array_equal(looped, vector))
print(vector[:5])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# True
# [0 2 4 6 8]
