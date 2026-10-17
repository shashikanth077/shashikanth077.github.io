# -*- coding: utf-8 -*-
# ==========================================================================
# PCA, step by step [machine-learning / Seeing and reducing data]
# ==========================================================================
# WHAT IT IS
# Principal component analysis finds perpendicular directions of maximum
# variance. Steps: (1) centre each feature by subtracting its mean; (2)
# usually standardise when units differ; (3) compute the covariance matrix;
# (4) find its eigenvectors and eigenvalues; (5) sort the directions by
# eigenvalue; (6) project each row onto the first two: z = X·w. The
# explained-variance ratio of a component is its eigenvalue divided by the sum
# of all eigenvalues. PCA is unsupervised: it creates coordinates, not labels.
#
# WHERE YOU USE IT
# PCA components are mixtures of the original features: inspect the loadings
# and report the explained variance. A 2D picture can hide information.
#
# RUN IT:  python 02_viz-2.py
#

import numpy as np

X = np.array([[2.4, 2], [2.8, 3], [2.6, 2], [12, 12], [11, 10], [12.5, 13], [5, 5], [5.2, 6]])
Xc = X - X.mean(axis=0)
cov = np.cov(Xc.T, bias=True)
values, vectors = np.linalg.eigh(cov)
order = values.argsort()[::-1]
values, vectors = values[order], vectors[:, order]
print(values.round(3).tolist(), (values / values.sum()).round(3).tolist())
print(vectors[:, 0].round(3).tolist(), (Xc @ vectors[:, 0]).shape)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [34.319, 0.149] [0.996, 0.004]
# [0.702, 0.712] (8,)
