# -*- coding: utf-8 -*-
# ==========================================================================
# k-means clustering [maths-ai / Maths inside ML algorithms]
# ==========================================================================
# WHAT IT IS
# k-means groups unlabeled points. Place k centres, assign every point to its
# nearest centre, move each centre to the mean of its points, and repeat until
# nothing changes. Each round is just distance and averaging. The result
# depends on the starting centres, so it is usually run several times.
#
# WHERE YOU USE IT
# Used to group customers, compress colours and build vocabularies of image or
# audio features.
#
# RUN IT:  python 02_ml-1.py
#

points = [1, 2, 3, 10, 11, 12]
c1, c2 = 2, 5
for _ in range(3):
    g1 = [p for p in points if abs(p - c1) <= abs(p - c2)]
    g2 = [p for p in points if abs(p - c1) > abs(p - c2)]
    c1, c2 = sum(g1) / len(g1), sum(g2) / len(g2)
    print(c1, c2)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 2.0 11.0
# 2.0 11.0
# 2.0 11.0
