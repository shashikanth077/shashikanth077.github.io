# -*- coding: utf-8 -*-
# ==========================================================================
# Data types and astype [numpy / Arrays: the basics]
# ==========================================================================
# WHAT IT IS
# Every array stores one data type (dtype): int64, float64, bool, uint8… A mix
# is upgraded to a common type, so one decimal makes the whole array float.
# astype converts — and converting float to int truncates toward zero, it does
# not round.
#
# WHERE YOU USE IT
# Pixels are uint8, model weights are float32 or float64; mismatched dtypes
# cause silent precision loss and shape-correct but wrong results.
#
# RUN IT:  python 05_start-4.py
#

import numpy as np

a = np.array([1, 2, 3], dtype=np.float64)
print(a.dtype)
print(a.astype(np.int32))
b = np.array([1, 2.5, 3])
print(b)
c = np.array([3.9, -3.9]).astype(int)
print(c)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# float64
# [1 2 3]
# [1.  2.5 3. ]
# [ 3 -3]
