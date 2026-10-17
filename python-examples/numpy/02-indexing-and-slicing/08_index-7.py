# -*- coding: utf-8 -*-
# ==========================================================================
# Fancy indexing with lists of positions [numpy / Indexing and slicing]
# ==========================================================================
# WHAT IT IS
# Index with a list (or array) of positions to pick elements in any order,
# repeating if you like: a[[0, 2, 4]]. Unlike a slice, fancy indexing returns
# a COPY. Combined with argsort it reorders data by another array; with a
# random permutation it shuffles rows.
#
# WHERE YOU USE IT
# Shuffling a dataset, picking a batch by index, or sorting predictions by
# confidence all use index arrays.
#
# RUN IT:  python 08_index-7.py
#

import numpy as np

a = np.array([10, 20, 30, 40, 50, 60])
print(a[[0, 2, 4]])
print(a[[5, 0, 0]])
scores = np.array([0.3, 0.9, 0.1])
names = np.array(["a", "b", "c"])
print(names[np.argsort(-scores)])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [10 30 50]
# [60 10 10]
# ['b' 'a' 'c']
