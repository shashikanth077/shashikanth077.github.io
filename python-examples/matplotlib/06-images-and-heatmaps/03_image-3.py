# -*- coding: utf-8 -*-
# ==========================================================================
# Correlation heatmap [matplotlib / Images and heatmaps]
# ==========================================================================
# WHAT IT IS
# np.corrcoef (or df.corr()) returns the correlation of every pair of columns:
# +1 move together, −1 move opposite, 0 unrelated. Show it with imshow(corr,
# cmap="coolwarm", vmin=-1, vmax=1) so the colours are centred on zero. Strong
# cells between a feature and the target are promising; strong cells between
# two features are redundant.
#
# WHERE YOU USE IT
# A first look at a new dataset: which features move with the target, and
# which duplicate each other?
#
# RUN IT:  python 03_image-3.py
#

import numpy as np
import matplotlib.pyplot as plt

study = np.array([1, 2, 3, 4, 5, 6, 7])
marks = np.array([35, 43, 50, 62, 67, 78, 86])
screen = np.array([6, 5, 5, 4, 3, 3, 2])
corr = np.corrcoef([study, marks, screen])

fig, ax = plt.subplots()
im = ax.imshow(corr, cmap="coolwarm", vmin=-1, vmax=1)
names = ["study", "marks", "screen"]
ax.set_xticks(range(3), labels=names)
ax.set_yticks(range(3), labels=names)
fig.colorbar(im, ax=ax)
plt.show()
print(corr.round(2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [[ 1.    1.   -0.98]
#  [ 1.    1.   -0.98]
#  [-0.98 -0.98  1.  ]]
