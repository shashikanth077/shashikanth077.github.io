# -*- coding: utf-8 -*-
# ==========================================================================
# Mean, median and mode [machine-learning / Statistics you need]
# ==========================================================================
# WHAT IT IS
# Three ways to find the "typical" value. The mean adds everything and divides
# by the count; the median is the middle value after sorting; the mode is the
# most frequent. For ticket times 2, 3, 3, 4, 18 minutes the mean is 6, but
# the median and mode are 3. One outlier drags the mean, not the median. Drag
# the last value.
#
# WHERE YOU USE IT
# Report the median for skewed data (salaries, waiting times). Use the mean
# when values are symmetric and you need totals.
#
# RUN IT:  python 01_stats-0.py
#

import numpy as np

x = np.array([2, 3, 3, 4, 18])
print(x.mean(), np.median(x))
values, counts = np.unique(x, return_counts=True)
print(int(values[counts.argmax()]))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 6.0 3.0
# 3
