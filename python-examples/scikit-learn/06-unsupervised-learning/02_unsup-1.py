# -*- coding: utf-8 -*-
# ==========================================================================
# Choosing k: the elbow method [scikit-learn / Unsupervised learning]
# ==========================================================================
# WHAT IT IS
# inertia_ is the total squared distance from each point to its centre. It
# always falls as k grows (at k = number of points it reaches 0), so you look
# for the elbow: the k after which adding clusters barely helps. The data here
# has three natural groups: the inertia plunges from k = 2 to 3 and then
# flattens. Pair the elbow with domain sense and a silhouette score.
#
# WHERE YOU USE IT
# The elbow is a guide, not a rule. Business meaning ("we can run 3
# campaigns") often decides.
#
# RUN IT:  python 02_unsup-1.py
#

import numpy as np
from sklearn.cluster import KMeans

X = np.array([[1, 1], [1.5, 2], [1, 1.5], [8, 8], [8.5, 9], [9, 8.5], [1, 9], [2, 8.5], [1.5, 9.5]])
inertias = [KMeans(n_clusters=k, n_init=10, random_state=0).fit(X).inertia_ for k in range(1, 5)]
print(all(a > b for a, b in zip(inertias, inertias[1:])))
print((inertias[1] - inertias[2]) > 5 * (inertias[2] - inertias[3]))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# True
# True
