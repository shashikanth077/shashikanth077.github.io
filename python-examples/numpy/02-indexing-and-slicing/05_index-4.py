# -*- coding: utf-8 -*-
# ==========================================================================
# Boolean masks: filtering without loops [numpy / Indexing and slicing]
# ==========================================================================
# WHAT IT IS
# A comparison like marks >= 50 gives an array of True/False — a mask. Use the
# mask as an index and you keep only the True positions: marks[marks >= 50].
# No loop, and it works on any shape. Unlike a slice, a mask selection returns
# a copy.
#
# WHERE YOU USE IT
# Selecting rows that meet a condition (labels equal 1, values above a
# threshold, non-missing entries) is a mask.
#
# RUN IT:  python 05_index-4.py
#

import numpy as np

marks = np.array([35, 48, 50, 67, 91])
mask = marks >= 50
print(mask)
print(marks[mask])
print(marks[marks < 50])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [False False  True  True  True]
# [50 67 91]
# [35 48]
