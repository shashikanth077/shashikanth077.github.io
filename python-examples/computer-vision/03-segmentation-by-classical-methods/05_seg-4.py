# -*- coding: utf-8 -*-
# ==========================================================================
# Colour segmentation with k-means [computer-vision / Segmentation by
# classical methods]
# ==========================================================================
# WHAT IT IS
# Treat each pixel as a point (R, G, B) and run k-means: choose k centres,
# assign every pixel to the nearest centre, move the centres to the mean of
# their pixels, repeat. The result groups pixels by colour: with k = 2 a red
# apple on a green background separates into two clusters, and replacing every
# pixel by its centre gives a "posterised" picture. Pixels far apart in the
# image but similar in colour end up together, which is why colour-only
# segmentation can be noisy; adding the (x, y) position to the feature vector
# makes regions spatially compact.
#
# WHERE YOU USE IT
# Convert to Lab or HSV first for distances that match human colour
# perception.
#
# RUN IT:  python 05_seg-4.py
#

import numpy as np

rng = np.random.default_rng(0)
red = rng.normal([200, 30, 30], 10, (50, 3))
green = rng.normal([40, 160, 50], 10, (50, 3))
X = np.vstack([red, green])
centres = X[[0, 60]].copy()
for _ in range(10):
    labels = np.argmin(((X[:, None] - centres[None]) ** 2).sum(axis=2), axis=1)
    centres = np.array([X[labels == k].mean(axis=0) for k in range(2)])
print(centres.round(0).tolist(), np.bincount(labels).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [[198.0, 31.0, 33.0], [40.0, 159.0, 47.0]] [50, 50]
