# -*- coding: utf-8 -*-
# ==========================================================================
# Outliers: the IQR rule and clip [pandas / Cleaning messy data]
# ==========================================================================
# WHAT IT IS
# A common outlier test: with Q1 = quantile(0.25), Q3 = quantile(0.75) and IQR
# = Q3 − Q1, flag values outside Q1 − 1.5·IQR to Q3 + 1.5·IQR. Then decide:
# investigate, drop, or clip(upper=…) to cap them. Capping keeps the row but
# limits the damage a single extreme value can do to a mean or a model.
#
# WHERE YOU USE IT
# A flagged value is a question, not a verdict: a typo, a faulty sensor or a
# rare real event. Look before you delete.
#
# RUN IT:  python 07_clean-6.py
#

import pandas as pd

s = pd.Series([10, 12, 13, 14, 15, 16, 17, 18, 50])
q1, q3 = s.quantile([0.25, 0.75])
iqr = q3 - q1
low, high = q1 - 1.5 * iqr, q3 + 1.5 * iqr
print(q1, q3, high)
print(s[(s < low) | (s > high)].tolist())
print(s.clip(upper=high).max())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 13.0 17.0 23.0
# [50]
# 23
