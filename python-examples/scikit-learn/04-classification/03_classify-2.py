# -*- coding: utf-8 -*-
# ==========================================================================
# K-nearest neighbours [scikit-learn / Classification]
# ==========================================================================
# WHAT IT IS
# KNeighborsClassifier(n_neighbors=k) has no real training: it stores the
# examples and, for a new point, finds the k closest ones and takes a majority
# vote. Small k follows every point, noise included; large k smooths. Here one
# noisy class-1 point sits among class-0 points: at k = 1 it carves out its
# own island, at k = 3 and 5 the vote ignores it. Drag k.
#
# WHERE YOU USE IT
# Simple and strong on small data, but slow on large data and very sensitive
# to feature scale.
#
# RUN IT:  python 03_classify-2.py
#

from sklearn.neighbors import KNeighborsClassifier

X = [[1], [2], [3], [10], [11], [12]]
y = [0, 0, 0, 1, 1, 1]
knn = KNeighborsClassifier(n_neighbors=3).fit(X, y)
print(knn.predict([[4], [9]]).tolist())
print(knn.kneighbors([[4]], return_distance=False).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0, 1]
# [[2, 1, 0]]
