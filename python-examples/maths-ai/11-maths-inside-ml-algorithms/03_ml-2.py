# -*- coding: utf-8 -*-
# ==========================================================================
# PCA: the direction of most variance [maths-ai / Maths inside ML algorithms]
# ==========================================================================
# WHAT IT IS
# PCA finds new axes along which the data varies most. Centre the data,
# compute its covariance matrix, and take its eigenvectors: the first
# principal component is the direction with the largest eigenvalue (variance).
# Projecting onto the top few components compresses the data while keeping
# most of its information.
#
# WHERE YOU USE IT
# Used to reduce hundreds of features to a few, visualise embeddings in 2D,
# and remove redundant correlated inputs.
#
# RUN IT:  python 03_ml-2.py
#

import math
xs = [-3, -2, -1, 0, 1, 2, 3, 0.5]
ys = [-2.2, -1.9, -0.6, 0.3, 0.9, 1.4, 2.5, 0.2]
n = len(xs)
mx, my = sum(xs) / n, sum(ys) / n
sxx = sum((x - mx) ** 2 for x in xs) / n
syy = sum((y - my) ** 2 for y in ys) / n
sxy = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / n
theta = 0.5 * math.atan2(2 * sxy, sxx - syy)
print(round(math.degrees(theta), 1))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 38.5
