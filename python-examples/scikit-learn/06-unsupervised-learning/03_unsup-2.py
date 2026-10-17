# -*- coding: utf-8 -*-
# ==========================================================================
# PCA: fewer columns, most of the information [scikit-learn / Unsupervised
# learning]
# ==========================================================================
# WHAT IT IS
# PCA(n_components=1) finds the direction along which the data vary most and
# projects every point onto it, so two columns become one while keeping as
# much variation as possible. Drag the angle of the axis: the share of the
# total variance it captures peaks at the data's long direction (about 45°)
# and is lowest across it. The ratio is reported as explained_variance_ratio_.
#
# WHERE YOU USE IT
# PCA compresses hundreds of correlated columns, removes noise and lets you
# plot high-dimensional data in 2D. Scale first.
#
# RUN IT:  python 03_unsup-2.py
#

import numpy as np
from sklearn.decomposition import PCA

X = np.array([[1, 2], [2, 4], [3, 6], [4, 8]])
pca = PCA(n_components=1).fit(X)
Z = pca.transform(X)
print(round(float(pca.explained_variance_ratio_[0]), 2))
print(Z.shape)
print(bool(np.allclose(pca.inverse_transform(Z), X)))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1.0
# (4, 1)
# True
