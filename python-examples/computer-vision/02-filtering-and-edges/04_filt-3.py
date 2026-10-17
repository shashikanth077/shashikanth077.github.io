# -*- coding: utf-8 -*-
# ==========================================================================
# Sharpening and the Laplacian [computer-vision / Filtering and edges]
# ==========================================================================
# WHAT IT IS
# The Laplacian kernel [[0, 1, 0], [1, −4, 1], [0, 1, 0]] measures how
# different a pixel is from its neighbours (a second derivative): it is zero
# on flat areas and ramps and responds at edges and corners. Sharpening adds
# some of that detail back: sharpened = original − α·Laplacian. With α = 1 the
# kernel [[0, −1, 0], [−1, 5, −1], [0, −1, 0]] results. Unsharp masking does
# the same by subtracting a blurred copy: out = img + amount × (img − blur).
# Too much sharpening amplifies noise and produces halos.
#
# WHERE YOU USE IT
# Because the Laplacian is a second derivative it is very noise-sensitive;
# blur first (Laplacian of Gaussian).
#
# RUN IT:  python 04_filt-3.py
#

import numpy as np

lap = np.array([[0, 1, 0], [1, -4, 1], [0, 1, 0]])
flat = np.full((3, 3), 50)
spot = flat.copy()
spot[1, 1] = 90
print(int((flat * lap).sum()), int((spot * lap).sum()))
sharp = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
print(int((spot * sharp).sum()))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0 -160
# 250
