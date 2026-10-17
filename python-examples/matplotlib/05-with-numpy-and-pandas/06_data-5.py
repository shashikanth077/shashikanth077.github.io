# -*- coding: utf-8 -*-
# ==========================================================================
# df.plot: the pandas shortcut [matplotlib / With NumPy and pandas]
# ==========================================================================
# WHAT IT IS
# A DataFrame can draw itself: df.plot(x="week", y=["a", "b"]) makes a line
# chart with a legend, using Matplotlib underneath, and returns the Axes so
# you can keep customising it (ax.set_ylabel(…)). Pick the style with
# kind="bar", "hist", "scatter" or "box". Fast for exploring; use plain fig,
# ax when you need full control.
#
# WHERE YOU USE IT
# df.plot is what you will see in most notebooks. Passing ax=ax puts it onto
# an Axes you created, which lets you combine it with Matplotlib calls.
#
# RUN IT:  python 06_data-5.py
#

import pandas as pd
import matplotlib.pyplot as plt

df = pd.DataFrame({"week": [1, 2, 3, 4], "a": [3, 5, 4, 8], "b": [2, 3, 5, 6]})
ax = df.plot(x="week", y=["a", "b"], marker="o", title="Two products")
ax.set_ylabel("Sales")
plt.show()
print(type(ax).__name__)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# Axes
