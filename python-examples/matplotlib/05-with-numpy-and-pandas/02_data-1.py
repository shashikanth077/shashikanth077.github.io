# -*- coding: utf-8 -*-
# ==========================================================================
# The sigmoid curve [matplotlib / With NumPy and pandas]
# ==========================================================================
# WHAT IT IS
# The sigmoid squashes any number into the range 0 to 1: 1 / (1 + np.exp(-z)).
# At z = 0 it is exactly 0.5, large positive inputs approach 1 and large
# negative ones approach 0. That is why it turns a score into a probability.
# Drag z along the curve.
#
# WHERE YOU USE IT
# Logistic regression and the output layer of a binary classifier use it.
# Plotting it shows the saturation: far from zero the curve is flat, so
# learning slows.
#
# RUN IT:  python 02_data-1.py
#

import numpy as np
import matplotlib.pyplot as plt

z = np.linspace(-6, 6, 200)
sig = 1 / (1 + np.exp(-z))

fig, ax = plt.subplots()
ax.plot(z, sig)
ax.axhline(0.5, color="gray", linestyle="--")
ax.set(title="Sigmoid", xlabel="z", ylabel="σ(z)")
plt.show()
print(round(float(1 / (1 + np.exp(-2))), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.881
