# -*- coding: utf-8 -*-
# ==========================================================================
# Splitting arrays [numpy / Reshaping and combining]
# ==========================================================================
# WHAT IT IS
# np.split(a, 3) cuts an array into equal pieces (the length must divide
# evenly; np.array_split allows unequal parts). You can also split at
# positions: np.split(a, [2, 5]). Slices do the same job for a single
# train/test cut.
#
# WHERE YOU USE IT
# Splitting a dataset into folds for cross-validation, or a long signal into
# windows.
#
# RUN IT:  python 06_shape-5.py
#

import numpy as np

a = np.arange(1, 7)
print(np.split(a, 3))
print(np.split(a, [2, 5]))
folds = np.array_split(np.arange(10), 3)
print([len(f) for f in folds])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [array([1, 2]), array([3, 4]), array([5, 6])]
# [array([1, 2]), array([3, 4, 5]), array([6])]
# [4, 3, 3]
