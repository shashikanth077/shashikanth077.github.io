# -*- coding: utf-8 -*-
# ==========================================================================
# K-medoids: a real example as the centre [machine-learning / Clustering]
# ==========================================================================
# WHAT IT IS
# K-means can put a centre between houses. K-medoids chooses an actual data
# point as each representative (the medoid) and uses ordinary rather than
# squared distance, so a far-away order has less pull. One cluster on a road
# with stops at 1, 2, 3, 4 and 30 km: the mean is 8 km, but the stop
# minimising the total distance is 3 km (totals 35, 32, 31, 32, 110). PAM
# swaps medoids to improve; CLARA runs the search on samples. K-medoids still
# needs K and a meaningful distance and is not immune to bad data. Drag the
# remote stop.
#
# WHERE YOU USE IT
# Use it when a representative must be a real record (a pickup address, a
# typical support ticket) or when you have a custom distance.
#
# RUN IT:  python 10_cluster-14.py
#

import numpy as np

x = np.array([1, 2, 3, 4, 30], dtype=float)
totals = [float(np.abs(x - c).sum()) for c in x]
print(x.mean(), totals, float(x[int(np.argmin(totals))]))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 8.0 [35.0, 32.0, 31.0, 32.0, 110.0] 3.0
