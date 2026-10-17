# -*- coding: utf-8 -*-
# ==========================================================================
# Anatomy of a graph: figure, axes, ticks, legend [matplotlib / First charts]
# ==========================================================================
# WHAT IT IS
# Before learning commands, learn the words. The Figure is the whole image.
# Inside it sit one or more Axes — the rectangle where data is drawn, with an
# x-axis and a y-axis. The axes show numbered ticks, a title, labels, an
# optional legend and grid, and hold the artists: lines, bars and dots.
# Documentation and error messages use these words constantly.
#
# WHERE YOU USE IT
# "Axes" does not mean "two axis lines" — it is one whole chart. A figure with
# a 2 × 2 grid has four Axes.
#
# RUN IT:  python 04_start-3.py
#

import matplotlib.pyplot as plt

fig, ax = plt.subplots()
ax.plot([1, 2, 3], [3, 5, 4])
print(type(fig).__name__)
print(type(ax).__name__)
print(len(ax.lines))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# Figure
# Axes
# 1
