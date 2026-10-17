# -*- coding: utf-8 -*-
# ==========================================================================
# Comparing activation functions [matplotlib / With NumPy and pandas]
# ==========================================================================
# WHAT IT IS
# Draw several functions on one set of axes to compare them: ReLU
# (np.maximum(0, x)) is zero for negatives and a straight line for positives;
# np.tanh squashes to −1…1; sigmoid squashes to 0…1. Give each a label and
# call ax.legend(). Drag the marker to read all three at the same input.
#
# WHERE YOU USE IT
# Choosing an activation is easier once you have seen their shapes side by
# side.
#
# RUN IT:  python 03_data-2.py
#

import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(-4, 4, 200)
fig, ax = plt.subplots()
ax.plot(x, np.maximum(0, x), label="ReLU")
ax.plot(x, np.tanh(x), label="tanh")
ax.plot(x, 1 / (1 + np.exp(-x)), label="sigmoid")
ax.legend()
plt.show()
print(np.maximum(0, -1.5), round(float(np.tanh(1.5)), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.0 0.905
