# -*- coding: utf-8 -*-
# ==========================================================================
# k-nearest neighbours: ask the closest examples [machine-learning /
# Probability, neighbours and margins]
# ==========================================================================
# WHAT IT IS
# kNN does no training beyond storing the labelled points. To classify a query
# it measures the distance to every stored point, takes the k nearest and lets
# them vote. With Normal N1 = (1,1), N2 = (2,1), N3 = (1,2), Spam S1 = (4,4),
# S2 = (5,4), S3 = (4,5) and query Q = (2,2): distances √2, 1, 1 for the
# Normals and √8, √13, √13 for the Spam points; the three nearest are all
# Normal. Move the query and change k: rings mark the voters.
#
# WHERE YOU USE IT
# Choose k with validation data, not test labels. Scale features first;
# big-feature scale distorts neighbours.
#
# RUN IT:  python 04_classic-3.py
#

import numpy as np

train = {"N1": (1, 1, "Normal"), "N2": (2, 1, "Normal"), "N3": (1, 2, "Normal"),
         "S1": (4, 4, "Spam"), "S2": (5, 4, "Spam"), "S3": (4, 5, "Spam")}
q = (2, 2)
d = sorted((round(float(np.hypot(x - q[0], y - q[1])), 3), name, label) for name, (x, y, label) in train.items())
print(d[:3])
votes = [label for _, _, label in d[:3]]
print(max(set(votes), key=votes.count))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [(1.0, 'N2', 'Normal'), (1.0, 'N3', 'Normal'), (1.414, 'N1', 'Normal')]
# Normal
