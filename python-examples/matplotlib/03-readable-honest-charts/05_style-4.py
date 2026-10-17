# -*- coding: utf-8 -*-
# ==========================================================================
# Annotate: point at what matters [matplotlib / Readable, honest charts]
# ==========================================================================
# WHAT IT IS
# Don't make the reader hunt. ax.annotate("text", xy=(x, y), xytext=(x2, y2),
# arrowprops=…) draws a note with an arrow to a point; ax.axhline(y) and
# ax.axvline(x) draw a reference line (a target, a threshold, the best epoch);
# ax.text(x, y, "…") places plain text. One highlighted point teaches more
# than a paragraph.
#
# WHERE YOU USE IT
# Mark the epoch where validation loss is lowest, the threshold line on a
# metric, or the moment a deployment happened.
#
# RUN IT:  python 05_style-4.py
#

import matplotlib.pyplot as plt

weeks = [1, 2, 3, 4]
revenue = [3, 5, 4, 8]

fig, ax = plt.subplots()
ax.plot(weeks, revenue, marker="o")
ax.axhline(6, linestyle="--", color="gray")
ax.annotate("Best week", xy=(4, 8), xytext=(2.4, 8.4),
            arrowprops=dict(arrowstyle="->"))
plt.show()
print(len(ax.texts))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1
