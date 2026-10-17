# -*- coding: utf-8 -*-
# ==========================================================================
# Histogram: how are values spread out? [matplotlib / Core chart types]
# ==========================================================================
# WHAT IT IS
# A histogram groups numbers into ranges called bins and draws one bar per
# bin: its height is how many values fall in that range. Unlike a bar chart,
# the bars touch because the x-axis is a continuous number line. Drag the
# slider to count the 20 exam marks into the bins one by one.
#
# WHERE YOU USE IT
# Look at the distribution of every feature before training: is it skewed,
# does it have a long tail, are there impossible values?
#
# RUN IT:  python 07_chart-7.py
#

import numpy as np
import matplotlib.pyplot as plt

marks = [35, 42, 48, 50, 52, 55, 58, 60,
         61, 64, 66, 68, 70, 74, 76, 80,
         82, 83, 88, 92]

fig, ax = plt.subplots()
counts, edges, patches = ax.hist(marks, bins=6, edgecolor="black", color="skyblue")
ax.set(title="Distribution of Marks", xlabel="Marks", ylabel="Frequency")
plt.show()
print(counts)
print(edges)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [2. 3. 4. 4. 4. 3.]
# [35.  44.5 54.  63.5 73.  82.5 92. ]
