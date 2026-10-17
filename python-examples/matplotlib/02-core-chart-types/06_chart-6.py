# -*- coding: utf-8 -*-
# ==========================================================================
# Scatter: size, colour and transparency [matplotlib / Core chart types]
# ==========================================================================
# WHAT IT IS
# A scatter plot can carry more than two numbers. s sets each marker's size, c
# colours dots by a value (with a cmap and a colorbar to decode it), alpha
# makes dots see-through so overlapping points show their density, and marker
# changes the shape. Use these to add a third or fourth variable — without
# cluttering the chart.
#
# WHERE YOU USE IT
# With thousands of points, plain dots become a solid blob. A low alpha
# (0.1–0.3) reveals where they are dense.
#
# RUN IT:  python 06_chart-6.py
#

import numpy as np
import matplotlib.pyplot as plt

rng = np.random.default_rng(0)
x = rng.random(50)
y = rng.random(50)
size = rng.integers(20, 200, 50)

fig, ax = plt.subplots()
sc = ax.scatter(x, y, s=size, c=y, cmap="viridis", alpha=0.7)
fig.colorbar(sc, ax=ax, label="y value")
plt.show()
print(size.min() >= 20, len(sc.get_offsets()))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# True 50
