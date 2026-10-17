# -*- coding: utf-8 -*-
# ==========================================================================
# Spotting outliers with percentiles (IQR) [numpy / Missing data, randomness
# and files]
# ==========================================================================
# WHAT IT IS
# A simple outlier test: find the 25th and 75th percentiles (Q1, Q3), take the
# spread between them (IQR = Q3 − Q1), and flag values outside Q1 − 1.5·IQR to
# Q3 + 1.5·IQR. np.percentile(values, [25, 75]) gives both quartiles at once.
# The test ignores extreme values when judging what is "normal".
#
# WHERE YOU USE IT
# Sensor glitches and data-entry errors can wreck a model; the IQR rule is a
# fast first screen before cleaning.
#
# RUN IT:  python 02_data-1.py
#

import numpy as np

values = np.array([10, 12, 13, 14, 15, 16, 17, 18, 50])
q1, q3 = np.percentile(values, [25, 75])
iqr = q3 - q1
low, high = q1 - 1.5 * iqr, q3 + 1.5 * iqr
print(q1, q3, iqr)
print(low, high)
print(values[(values < low) | (values > high)])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 13.0 17.0 4.0
# 7.0 23.0
# [50]
