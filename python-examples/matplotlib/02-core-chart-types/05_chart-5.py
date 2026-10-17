# -*- coding: utf-8 -*-
# ==========================================================================
# Scatter plot: are two numbers related? [matplotlib / Core chart types]
# ==========================================================================
# WHAT IT IS
# A scatter plot draws one dot per observation: ax.scatter(x, y). Dots rising
# together suggest a relationship; a cloud means little; a lone dot far from
# the rest is an outlier. Toggle the unusual student on and off: one point
# swings the trend line from a slope of 8.6 marks per hour to 3.4 and the
# correlation from 0.998 to 0.394.
#
# WHERE YOU USE IT
# Plot features against the target before modelling. Correlation does not
# prove one thing causes the other, and one outlier can fake or hide a
# relationship.
#
# RUN IT:  python 05_chart-5.py
#

import numpy as np
import matplotlib.pyplot as plt

hours = np.array([1, 2, 3, 4, 5, 6, 7])
marks = np.array([35, 43, 50, 62, 67, 78, 86])

fig, ax = plt.subplots()
ax.scatter(hours, marks, color="purple", s=70)
ax.set(title="Study vs Exam Score", xlabel="Study hours", ylabel="Marks")
ax.grid(alpha=0.25)
plt.show()

slope, intercept = np.polyfit(hours, marks, 1)
print(round(slope, 2), round(intercept, 2))
print(round(np.corrcoef(hours, marks)[0, 1], 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 8.57 25.86
# 0.998
