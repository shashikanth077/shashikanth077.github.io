# -*- coding: utf-8 -*-
# ==========================================================================
# OPTICS: density at several scales [machine-learning / Clustering]
# ==========================================================================
# WHAT IT IS
# One DBSCAN radius cannot describe neighbourhoods of different density.
# OPTICS orders the points and records the reachability distance of each from
# an earlier core point: reach(q from p) = max(core_k(p), d(p, q)), keeping
# the smallest candidate. A plot of reachability along the ordering shows
# valleys for dense regions and peaks for gaps. Points [0, 0.2, 0.4, 3, 3.2,
# 3.4] with min_samples = 3 give reachabilities 0.4, 0.2, 2.6 (the jump across
# the gap), 0.4, 0.2. Extract clusters by cutting at an ε′ (DBSCAN-like) or by
# steepness (xi). Drag the cut.
#
# WHERE YOU USE IT
# The horizontal axis is the algorithm's ordering, not road position or time.
# A valley is a clue to inspect, not proof of a segment.
#
# RUN IT:  python 16_cluster-20.py
#

import numpy as np

pts = np.array([0, 0.2, 0.4, 3, 3.2, 3.4])
min_samples = 3
D = np.abs(pts[:, None] - pts[None])
core = np.sort(D, axis=1)[:, min_samples - 1]
reach = np.full(len(pts), np.inf)
done = np.zeros(len(pts), dtype=bool)
order = []
seeds = {0: np.inf}
while seeds:
    p = min(seeds, key=lambda i: (seeds[i], i))
    reach[p] = seeds.pop(p)
    done[p] = True
    order.append(p)
    for q in range(len(pts)):
        if not done[q]:
            new = max(core[p], D[p, q])
            if q not in seeds or new < seeds[q]:
                seeds[q] = new
print(order, core.round(2).tolist())
print([None if np.isinf(r) else round(float(r), 2) for r in reach])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0, 1, 2, 3, 4, 5] [0.4, 0.2, 0.4, 0.4, 0.2, 0.4]
# [None, 0.4, 0.2, 2.6, 0.4, 0.2]
