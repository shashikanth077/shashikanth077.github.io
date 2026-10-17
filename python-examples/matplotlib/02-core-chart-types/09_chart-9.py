# -*- coding: utf-8 -*-
# ==========================================================================
# Box plot: spread and outliers [matplotlib / Core chart types]
# ==========================================================================
# WHAT IT IS
# A box plot compresses a whole dataset into five numbers. The box runs from
# Q1 (25th percentile) to Q3 (75th), the line inside is the median, and the
# whiskers reach the furthest points within 1.5 × IQR of the box (IQR = Q3 −
# Q1). Anything beyond is drawn as a separate dot — a potential outlier, not
# automatically a mistake. Drag the suspicious reading.
#
# WHERE YOU USE IT
# Compare a feature across groups with side-by-side boxes. A flagged point is
# a question to investigate: sensor glitch, data-entry error or a genuinely
# rare case.
#
# RUN IT:  python 09_chart-9.py
#

import numpy as np
import matplotlib.pyplot as plt

weights = np.array([98, 99, 99, 100, 100, 101, 101, 102, 145])

fig, ax = plt.subplots()
ax.boxplot(weights, orientation="horizontal")   # Matplotlib 3.10+; older: vert=False
ax.set(title="Package Weights", xlabel="Weight (g)")
plt.show()

q1, q3 = np.percentile(weights, [25, 75])
iqr = q3 - q1
low, high = q1 - 1.5 * iqr, q3 + 1.5 * iqr
print(q1, q3, iqr)
print(low, high)
print(weights[(weights < low) | (weights > high)])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 99.0 101.0 2.0
# 96.0 104.0
# [145]
