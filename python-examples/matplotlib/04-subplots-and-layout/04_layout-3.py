# -*- coding: utf-8 -*-
# ==========================================================================
# Spacing: tight_layout and constrained layout [matplotlib / Subplots and
# layout]
# ==========================================================================
# WHAT IT IS
# Titles and labels can collide with neighbouring panels or be cut off.
# fig.tight_layout() nudges the spacing so everything fits; the newer
# plt.subplots(..., layout="constrained") does this continuously and also
# handles colorbars and legends better. When saving, bbox_inches="tight" trims
# the border. Pick one approach per figure.
#
# WHERE YOU USE IT
# If axis labels overlap or are chopped off in a saved image, the layout is
# the first thing to fix.
#
# RUN IT:  python 04_layout-3.py
#

import matplotlib.pyplot as plt

fig, axes = plt.subplots(2, 2, layout="constrained")
for ax in axes.flat:
    ax.set(title="A long title", xlabel="x label", ylabel="y label")
plt.show()
print(type(fig.get_layout_engine()).__name__)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ConstrainedLayoutEngine
