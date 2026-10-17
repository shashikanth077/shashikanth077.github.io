# -*- coding: utf-8 -*-
# ==========================================================================
# Views versus copies [numpy / Views, speed and pitfalls]
# ==========================================================================
# WHAT IT IS
# A slice of an array is a VIEW: a window onto the same memory. Changing the
# slice changes the original. .copy() makes an independent array; fancy
# indexing and boolean masks also return copies. np.shares_memory(a, b) tells
# you which you have.
#
# WHERE YOU USE IT
# Normalising a "slice" of your raw data in place silently corrupts the
# original — a classic source of leakage and irreproducible results.
#
# RUN IT:  python 01_memory-0.py
#

import numpy as np

a = np.array([10, 20, 30])
view = a[1:]
view[0] = 999
print(a)
b = a[1:].copy()
b[0] = 50
print(a)
print(np.shares_memory(a, view), np.shares_memory(a, b))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [ 10 999  30]
# [ 10 999  30]
# True False
