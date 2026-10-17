# -*- coding: utf-8 -*-
# ==========================================================================
# The curse of dimensionality [machine-learning / Seeing and reducing data]
# ==========================================================================
# WHAT IT IS
# With many features, "near" and "far" lose contrast. Pick a random query
# point and 200 random points in d dimensions: in 2D the farthest is many
# times farther than the nearest; in 1,000 dimensions the nearest and the
# farthest are almost the same distance, so distance-based methods (kNN,
# k-means, DBSCAN) struggle. Also the data needed to cover the space grows
# exponentially. Remedies: select or engineer fewer features, reduce
# dimensions (PCA), or use a distance suited to the data (cosine for text).
# The output panel shows the nearest/farthest ratio for several d.
#
# WHERE YOU USE IT
# Adding features is not free: irrelevant ones add noise to every distance.
#
# RUN IT:  python 01_viz-1.py
#

import numpy as np

rng = np.random.default_rng(0)
for d in (2, 10, 100, 1000):
    pts = rng.random((200, d))
    q = rng.random(d)
    dist = np.linalg.norm(pts - q, axis=1)
    print(d, round(float(dist.min() / dist.max()), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 2 0.004
# 10 0.369
# 100 0.696
# 1000 0.901
