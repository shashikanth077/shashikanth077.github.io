# -*- coding: utf-8 -*-
# ==========================================================================
# Plotting a function with NumPy [matplotlib / With NumPy and pandas]
# ==========================================================================
# WHAT IT IS
# Matplotlib draws lists of numbers, and NumPy makes them. x = np.linspace(0,
# 2 np.pi, 200) gives 200 evenly spaced inputs; y = np.sin(x) computes all 200
# outputs at once; ax.plot(x, y) joins them into a smooth curve. More points
# means a smoother curve. Drag the sliders to see amplitude and frequency
# change the shape.
#
# WHERE YOU USE IT
# Activation functions, loss surfaces, probability densities and learning-rate
# schedules are all plotted this way.
#
# RUN IT:  python 01_data-0.py
#

import numpy as np
import matplotlib.pyplot as plt

x = np.linspace(0, 2 * np.pi, 200)
y = np.sin(x)

fig, ax = plt.subplots()
ax.plot(x, y)
ax.set(title="sin(x)", xlabel="x", ylabel="sin(x)")
plt.show()
print(x.shape, round(y.max(), 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# (200,) 1.0
