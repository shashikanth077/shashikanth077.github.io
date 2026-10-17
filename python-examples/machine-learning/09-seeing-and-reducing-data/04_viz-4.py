# -*- coding: utf-8 -*-
# ==========================================================================
# LDA versus PCA: supervised direction finding [machine-learning / Seeing and
# reducing data]
# ==========================================================================
# WHAT IT IS
# PCA ignores labels and finds the direction of greatest overall variance.
# Linear discriminant analysis uses the class labels: it looks for the
# direction that best SEPARATES the classes — a large distance between the
# class means relative to the spread within each class (the Fisher ratio). The
# two can disagree. Here both classes stretch along the diagonal, so PCA picks
# the diagonal (about 55°), but the classes are offset vertically, so LDA
# picks a direction across the diagonal (about 130°). Drag the angle.
#
# WHERE YOU USE IT
# LDA needs labels and is at most (classes − 1) dimensional. It is not the
# same method as latent Dirichlet allocation, which is a topic model.
#
# RUN IT:  python 04_viz-4.py
#

import numpy as np

A = np.array([[1, 2.2], [2, 3.2], [3, 3.8], [4, 5.0]])
B = np.array([[1, 0.3], [2, 0.8], [3, 2.3], [4, 2.7]])
Sw = np.cov(A.T, bias=True) * 4 + np.cov(B.T, bias=True) * 4
d = A.mean(axis=0) - B.mean(axis=0)
w = np.linalg.solve(Sw, d)
print(d.round(3).tolist(), (w / np.linalg.norm(w)).round(3).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0.0, 2.025] [-0.663, 0.749]
