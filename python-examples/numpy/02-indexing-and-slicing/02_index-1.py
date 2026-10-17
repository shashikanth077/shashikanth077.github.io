# -*- coding: utf-8 -*-
# ==========================================================================
# Slicing: start:stop:step [numpy / Indexing and slicing]
# ==========================================================================
# WHAT IT IS
# a[start:stop] selects a run of elements: the start is included and the stop
# is excluded. Leave one blank for "from the beginning" or "to the end". A
# third number is the step, and [::-1] reverses. A slice of an array is a VIEW
# of the same data, not a copy.
#
# WHERE YOU USE IT
# Splitting data into train/test, taking a window of a time series, or
# selecting a column all use slicing.
#
# RUN IT:  python 02_index-1.py
#

import numpy as np

a = np.array([10, 20, 30, 40, 50, 60])
print(a[1:4])
print(a[:3])
print(a[-2:])
print(a[::2])
print(a[::-1])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [20 30 40]
# [10 20 30]
# [50 60]
# [10 30 50]
# [60 50 40 30 20 10]
