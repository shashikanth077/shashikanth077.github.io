# -*- coding: utf-8 -*-
# ==========================================================================
# A grid of charts: 2 × 2 and flat [matplotlib / Subplots and layout]
# ==========================================================================
# WHAT IT IS
# With rows and columns you get a 2D array: fig, axes = plt.subplots(2, 2) and
# you pick a chart with axes[row, col]. To loop over all of them in order, use
# axes.flat — it walks the grid left-to-right, top-to-bottom. With one row or
# one column the array is 1D, and with a single chart plt.subplots() returns
# one Axes, not an array.
#
# WHERE YOU USE IT
# A common bug is axes[1, 0] on a 1 × 3 grid — check axes.shape first.
#
# RUN IT:  python 02_layout-1.py
#

import matplotlib.pyplot as plt

fig, axes = plt.subplots(2, 2, figsize=(7, 5))
for i, ax in enumerate(axes.flat):
    ax.plot([0, 1, 2], [0, i, i * 2])
    ax.set_title(f"Panel {i}")
fig.tight_layout()
plt.show()
print(axes.shape)
print(axes[1, 0] is axes.flat[2])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# (2, 2)
# True
