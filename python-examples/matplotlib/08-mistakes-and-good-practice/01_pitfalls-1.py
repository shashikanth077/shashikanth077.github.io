# -*- coding: utf-8 -*-
# ==========================================================================
# Unsorted x-values scramble the line [matplotlib / Mistakes and good
# practice]
# ==========================================================================
# WHAT IT IS
# ax.plot joins points in the order you give them. If the x-values are not in
# order the line jumps back and forth. Sort x and y together with
# np.argsort(x) and index both arrays by the result. A scatter plot does not
# care about order — only line charts do.
#
# WHERE YOU USE IT
# Data from a database or a merge is often unsorted. Sort by time before
# plotting a time series.
#
# RUN IT:  python 01_pitfalls-1.py
#

import numpy as np
import matplotlib.pyplot as plt

x = np.array([3, 1, 4, 2, 5])
y = np.array([5, 2, 6, 3, 7])
order = np.argsort(x)

fig, ax = plt.subplots()
ax.plot(x[order], y[order], marker="o")
plt.show()
print(x[order], y[order])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [1 2 3 4 5] [2 3 5 6 7]
