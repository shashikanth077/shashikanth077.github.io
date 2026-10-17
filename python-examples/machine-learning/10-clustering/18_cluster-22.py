# -*- coding: utf-8 -*-
# ==========================================================================
# BIRCH: summarise before clustering [machine-learning / Clustering]
# ==========================================================================
# WHAT IT IS
# BIRCH keeps compact summaries of a large stream in a clustering-feature (CF)
# tree. Each subcluster stores CF = (N, LS, SS): the count, the linear sum Σx
# and the squared sum Σ‖x‖². From it: centre = LS/N and radius² = SS/N −
# ‖LS/N‖². For [1, 2, 3]: N = 3, LS = 6, SS = 14, centre 2, radius √(2/3) ≈
# 0.816. Insert 4: N = 4, LS = 10, SS = 30, centre 2.5, radius √1.25 ≈ 1.118.
# With a radius threshold of 1 the summary cannot absorb it (a new entry is
# needed); with 1.2 it can. Drag the threshold.
#
# WHERE YOU USE IT
# The radius is a root-mean-square spread, not the farthest-point distance.
# Scale features; summaries can hide fine structure.
#
# RUN IT:  python 18_cluster-22.py
#

import numpy as np

def cf(points):
    p = np.array(points, dtype=float)
    return len(p), float(p.sum()), float((p ** 2).sum())

def radius(N, LS, SS):
    return float(np.sqrt(SS / N - (LS / N) ** 2))

print(cf([1, 2, 3]), round(radius(*cf([1, 2, 3])), 3))
print(cf([1, 2, 3, 4]), round(radius(*cf([1, 2, 3, 4])), 3))
print(6 / 2, radius(2, 6, 20))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# (3, 6.0, 14.0) 0.816
# (4, 10.0, 30.0) 1.118
# 3.0 1.0
