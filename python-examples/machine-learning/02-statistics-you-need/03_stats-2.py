# -*- coding: utf-8 -*-
# ==========================================================================
# Quartiles, IQR and shape [machine-learning / Statistics you need]
# ==========================================================================
# WHAT IT IS
# Q1 and Q3 cut off the lowest and highest quarter of the sorted data; IQR =
# Q3 − Q1 is the spread of the middle half and is not affected by extremes. A
# value beyond Q1 − 1.5·IQR or Q3 + 1.5·IQR is flagged as a possible outlier.
# A long tail to the right is positive skew (mean above median); the
# "peakedness" of the tails is kurtosis. Drag the last value past the fence.
#
# WHERE YOU USE IT
# The IQR rule is the first screen for outliers. A flagged value is something
# to investigate, not delete.
#
# RUN IT:  python 03_stats-2.py
#

import numpy as np

x = np.array([2, 3, 3, 4, 18])
q1, q3 = np.percentile(x, [25, 75])
iqr = q3 - q1
low, high = q1 - 1.5 * iqr, q3 + 1.5 * iqr
print(q1, q3, iqr)
print(low, high)
print(x[(x < low) | (x > high)].tolist(), x.mean() > np.median(x))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 3.0 4.0 1.0
# 1.5 5.5
# [18] True
