# -*- coding: utf-8 -*-
# ==========================================================================
# The fig, ax style (recommended) [matplotlib / First charts]
# ==========================================================================
# WHAT IT IS
# There are two ways to draw. The quick plt.plot() style quietly draws on "the
# current chart". The recommended style names the objects: fig, ax =
# plt.subplots() gives you the figure and the axes, and you call methods on
# ax: ax.plot, ax.set(title=…, xlabel=…, ylabel=…), ax.legend(). It scales to
# several charts because you always say which one you mean.
#
# WHERE YOU USE IT
# Notebooks, tutorials and production code use fig, ax. The plt. shortcut is
# fine for a one-off glance.
#
# RUN IT:  python 05_start-4.py
#

import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(7, 4))
ax.plot([1, 2, 3], [3, 5, 4], marker="o", label="Sales")
ax.set(title="My Chart", xlabel="Day", ylabel="Sales")
ax.legend()
ax.grid(alpha=0.25)
fig.tight_layout()
plt.show()
print(ax.get_title(), "|", ax.get_xlabel())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# My Chart | Day
