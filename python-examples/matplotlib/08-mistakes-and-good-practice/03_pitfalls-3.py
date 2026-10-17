# -*- coding: utf-8 -*-
# ==========================================================================
# plt vs ax: drawing on the wrong chart [matplotlib / Mistakes and good
# practice]
# ==========================================================================
# WHAT IT IS
# plt.plot() always draws on the current Axes — the most recently created one.
# With two charts open it is easy to draw on the wrong one. Call methods on
# the object you mean (ax1.plot) and the problem disappears.
#
# WHERE YOU USE IT
# A line that "doesn't show up" is often on a different Axes than the one you
# are looking at.
#
# RUN IT:  python 03_pitfalls-3.py
#

import matplotlib.pyplot as plt

fig1, ax1 = plt.subplots()
fig2, ax2 = plt.subplots()
plt.plot([1, 2, 3], [1, 2, 3])
print(len(ax1.lines), len(ax2.lines))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0 1
