# -*- coding: utf-8 -*-
# ==========================================================================
# Reading a dendrogram [machine-learning / Clustering]
# ==========================================================================
# WHAT IT IS
# Leaves at the bottom are single stops. A horizontal bar joins two branches
# at the height equal to their merge distance: P, Q at 1 and R, S at 3 (single
# linkage). Draw a horizontal cut between join heights; the branches it
# crosses are the clusters. Cut at 0.5 → 4 clusters; at 2 → 3 ({P,Q}, {R},
# {S}); at 4 → 2 ({P,Q}, {R,S}); at 6 → 1. Leaf spacing is layout, not a
# distance scale, and branches can be flipped without changing the result.
# Drag the cut.
#
# WHERE YOU USE IT
# A large vertical gap suggests a cut but does not prove the true number of
# groups. Avoid cutting exactly at a join when explaining.
#
# RUN IT:  python 07_cluster-7.py
#

import numpy as np

heights = np.array([1.0, 3.0, 5.0])
for cut in (0.5, 2, 4, 6):
    print(cut, int(len(heights) + 1 - (heights <= cut).sum()))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.5 4
# 2 3
# 4 2
# 6 1
