# -*- coding: utf-8 -*-
# ==========================================================================
# Missing values: NaN [numpy / Missing data, randomness and files]
# ==========================================================================
# WHAT IT IS
# Missing numbers are stored as np.nan ("not a number"). NaN is contagious:
# mean or sum of an array containing one returns NaN. Find them with np.isnan,
# ignore them with np.nanmean (and nansum, nanstd…), or drop them with a mask:
# a[~np.isnan(a)].
#
# WHERE YOU USE IT
# Real datasets have gaps. Decide deliberately whether to drop, fill or ignore
# NaNs before any model sees them.
#
# RUN IT:  python 01_data-0.py
#

import numpy as np

scores = np.array([20.0, np.nan, 30.0])
print(np.isnan(scores))
print(scores.mean())
print(np.nanmean(scores))
print(scores[~np.isnan(scores)])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [False  True False]
# nan
# 25.0
# [20. 30.]
