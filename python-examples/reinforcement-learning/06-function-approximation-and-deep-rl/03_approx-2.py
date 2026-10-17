# -*- coding: utf-8 -*-
# ==========================================================================
# Choosing features: coarse coding and tiles [reinforcement-learning /
# Function approximation and deep RL]
# ==========================================================================
# WHAT IT IS
# With a linear approximator the features decide what can be learned. One-hot
# over a grid reproduces a table. Tile coding overlays several offset grids
# ("tilings"); a continuous state activates exactly one tile in each tiling,
# so with 4 tilings each state activates 4 binary features and nearby states
# share tiles — wide generalisation, still fast. Polynomial and Fourier
# features and radial-basis functions are other options. Deep networks learn
# features automatically, which is why they dominate for images.
#
# WHERE YOU USE IT
# Tile coding is cheap and reliable for low-dimensional control problems; use
# networks for pixels.
#
# RUN IT:  python 03_approx-2.py
#

import numpy as np

def tiles(x, tilings=4, width=1.0, size=10):
    out = []
    for t in range(tilings):
        offset = t * width / tilings
        out.append(t * size + int((x + offset) // width))
    return out

print(tiles(2.3), tiles(2.6), len(tiles(2.3)))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [2, 12, 22, 33] [2, 12, 23, 33] 4
