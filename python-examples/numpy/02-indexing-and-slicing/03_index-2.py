# -*- coding: utf-8 -*-
# ==========================================================================
# Negative steps and strides [numpy / Indexing and slicing]
# ==========================================================================
# WHAT IT IS
# The step in a[::2] skips elements: every second one. A negative step walks
# backwards, so a[::-1] is the array reversed and a[-2:] is "the last two".
# Because slices are views, reversing or striding costs no copying at all.
#
# WHERE YOU USE IT
# Reversing a signal, subsampling every nth frame, or taking the most recent
# values are one-line slices.
#
# RUN IT:  python 03_index-2.py
#

import numpy as np

a = np.arange(10, 70, 10)
print(a[::2])
print(a[1::2])
print(a[::-1])
print(a[-3:])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [10 30 50]
# [20 40 60]
# [60 50 40 30 20 10]
# [40 50 60]
