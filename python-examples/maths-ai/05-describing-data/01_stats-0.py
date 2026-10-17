# -*- coding: utf-8 -*-
# ==========================================================================
# Mean, median and outliers [maths-ai / Describing data]
# ==========================================================================
# WHAT IT IS
# The mean adds everything and divides by the count; the median is the middle
# value once sorted. One extreme value (an outlier) drags the mean a long way
# but barely moves the median — so the median is "robust". Always look at both
# before trusting an average.
#
# WHERE YOU USE IT
# A few huge values in a dataset (prices, durations) can fool a model that
# relies on means; robust statistics and clipping guard against it.
#
# RUN IT:  python 01_stats-0.py
#

import statistics
marks = [3, 4, 5, 6, 30]
print(statistics.mean(marks), statistics.median(marks))
print(statistics.mean([3, 4, 5, 6]))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 9.6 5
# 4.5
