# -*- coding: utf-8 -*-
# ==========================================================================
# Legends and grid lines [matplotlib / Readable, honest charts]
# ==========================================================================
# WHAT IT IS
# A legend is built from the label you give each artist, so label first, then
# call ax.legend(); loc="upper left" moves it. ax.grid(alpha=0.3) adds faint
# reference lines that help the eye read values — keep them light so they
# never compete with the data.
#
# WHERE YOU USE IT
# If the legend hides your data, move it with loc or put it outside; if every
# series has the same colour, the legend can't help.
#
# RUN IT:  python 03_style-2.py
#

import matplotlib.pyplot as plt

fig, ax = plt.subplots()
ax.plot([1, 2, 3], [0.9, 0.6, 0.4], label="Train")
ax.plot([1, 2, 3], [1.0, 0.8, 0.75], label="Validation")
ax.legend(loc="upper right")
ax.grid(alpha=0.3)
plt.show()
print([t.get_text() for t in ax.get_legend().get_texts()])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ['Train', 'Validation']
