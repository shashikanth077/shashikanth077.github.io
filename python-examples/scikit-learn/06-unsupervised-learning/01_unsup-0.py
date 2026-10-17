# -*- coding: utf-8 -*-
# ==========================================================================
# K-means: grouping without labels [scikit-learn / Unsupervised learning]
# ==========================================================================
# WHAT IT IS
# Unsupervised learning has no y: the model looks for structure on its own.
# KMeans(n_clusters=2) repeats two moves — assign every point to its nearest
# centre, then move each centre to the average of its points — until nothing
# changes. Slide through the steps: the centres start in a poor place and walk
# to the middle of each group.
#
# WHERE YOU USE IT
# Customer segments, grouping similar documents, compressing colours in an
# image. Scale features first, because k-means uses distance.
#
# RUN IT:  python 01_unsup-0.py
#

import numpy as np
from sklearn.cluster import KMeans

X = np.array([[1, 1], [1.5, 2], [1, 1.5], [8, 8], [8.5, 9], [9, 8.5]])
km = KMeans(n_clusters=2, n_init=10, random_state=0).fit(X)
print(sorted(np.bincount(km.labels_).tolist()))
print(sorted(km.cluster_centers_[:, 0].round(2).tolist()))
print(round(float(km.inertia_), 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [3, 3]
# [1.17, 8.5]
# 1.67
