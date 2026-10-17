# -*- coding: utf-8 -*-
# ==========================================================================
# Finding lines: the Hough transform [computer-vision / Segmentation by
# classical methods]
# ==========================================================================
# WHAT IT IS
# A line can be written ρ = x cos θ + y sin θ. Every edge pixel (x, y) votes
# for all (ρ, θ) pairs of lines through it; points on a common line all vote
# for the same cell, so peaks in the accumulator are lines. Four points (0,0),
# (1,1), (2,2), (3,3) lie on y = x: for θ = 135° each gives ρ = 0 — four votes
# in one cell, while other cells get at most 1–2. The method is robust to gaps
# and noise because it needs only a vote majority. Circles use a 3-parameter
# version (centre and radius).
#
# WHERE YOU USE IT
# Probabilistic Hough (sampling points) is the usual fast variant in practice.
#
# RUN IT:  python 04_seg-3.py
#

import numpy as np

points = [(0, 0), (1, 1), (2, 2), (3, 3)]
thetas = np.arange(0, 180, 45)
votes = {}
for x, y in points:
    for th in thetas:
        rho = round(x * np.cos(np.radians(th)) + y * np.sin(np.radians(th)), 2)
        votes[(rho, int(th))] = votes.get((rho, int(th)), 0) + 1
best = max(votes, key=votes.get)
print((float(best[0]), best[1]), votes[best])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# (0.0, 135) 4
