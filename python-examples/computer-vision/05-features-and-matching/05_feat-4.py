# -*- coding: utf-8 -*-
# ==========================================================================
# RANSAC: fitting a model despite outliers [computer-vision / Features and
# matching]
# ==========================================================================
# WHAT IT IS
# Least squares is ruined by a few wrong matches. RANSAC repeatedly (1) draws
# the minimal number of points s needed to define the model (2 for a line, 4
# for a homography), (2) fits the model, (3) counts the points that agree
# within a tolerance (inliers), and keeps the model with the most inliers. How
# many tries? With inlier fraction w and wanted success probability p, N =
# ln(1 − p) / ln(1 − wˢ): for a line (s = 2), w = 0.5 and p = 0.99 that is ln
# 0.01 / ln 0.75 = 16.0, so 17 tries; for a homography (s = 4) with the same w
# it is 72. The final model is refit on all inliers.
#
# WHERE YOU USE IT
# More outliers or a bigger model need many more iterations; check w with a
# quick estimate.
#
# RUN IT:  python 05_feat-4.py
#

import numpy as np

n = lambda p, w, s: np.log(1 - p) / np.log(1 - w ** s)
print(round(float(n(0.99, 0.5, 2)), 1), int(np.ceil(n(0.99, 0.5, 2))), int(np.ceil(n(0.99, 0.5, 4))))
rng = np.random.default_rng(0)
x = np.arange(20.0)
y = 2 * x + 1 + rng.normal(0, 0.3, 20)
y[[3, 8, 15]] += 40
best = (0, None)
for _ in range(50):
    i, j = rng.choice(20, 2, replace=False)
    m = (y[j] - y[i]) / (x[j] - x[i])
    b = y[i] - m * x[i]
    inl = int((abs(y - (m * x + b)) < 1).sum())
    if inl > best[0]:
        best = (inl, (round(float(m), 2), round(float(b), 2)))
print(best)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 16.0 17 72
# (17, (1.99, 1.39))
