# -*- coding: utf-8 -*-
# ==========================================================================
# Titles, axis labels and units [matplotlib / Readable, honest charts]
# ==========================================================================
# WHAT IT IS
# A chart without words is a puzzle. Give every chart a title saying what it
# shows, an xlabel and ylabel naming each axis, and the unit in brackets —
# "Time (s)", "Revenue (€)". ax.set(title=…, xlabel=…, ylabel=…) sets all
# three in one call. Clear words matter more than decoration.
#
# WHERE YOU USE IT
# Charts are pasted into reports and slides without the surrounding text. The
# title and units must carry the meaning on their own.
#
# RUN IT:  python 01_style-0.py
#

import matplotlib.pyplot as plt

fig, ax = plt.subplots()
ax.plot([1, 2, 3, 4], [3, 5, 4, 8], marker="o")
ax.set(title="Weekly revenue", xlabel="Week", ylabel="Revenue (€)")
plt.show()
print(ax.get_title())
print(ax.get_ylabel())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# Weekly revenue
# Revenue (€)
