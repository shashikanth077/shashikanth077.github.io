# -*- coding: utf-8 -*-
# ==========================================================================
# Integer overflow and dtype surprises [numpy / Views, speed and pitfalls]
# ==========================================================================
# WHAT IT IS
# Integer dtypes have fixed ranges and silently WRAP AROUND: a uint8 (0–255)
# holding 200 plus 100 becomes 44, not 300. Convert first with astype when you
# need room. Division with / always gives floats; // floors to integers. Image
# pixels are uint8 — a classic trap.
#
# WHERE YOU USE IT
# Brightening an image array in uint8 produces dark speckles where values
# wrapped; convert to float, compute, then clip.
#
# RUN IT:  python 04_memory-3.py
#

import numpy as np

a = np.array([200, 250], dtype=np.uint8)
print(a + 100)
print(a.astype(int) + 100)
b = np.array([1, 2, 3])
print(b / 2)
print(b // 2)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [44 94]
# [300 350]
# [0.5 1.  1.5]
# [0 1 1]
