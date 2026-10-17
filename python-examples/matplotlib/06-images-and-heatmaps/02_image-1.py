# -*- coding: utf-8 -*-
# ==========================================================================
# Heatmap: a confusion matrix [matplotlib / Images and heatmaps]
# ==========================================================================
# WHAT IT IS
# A heatmap colours a table of numbers so large values stand out. For a
# classifier, rows are the actual classes, columns the predicted ones, and the
# diagonal holds the correct predictions. Draw it with ax.imshow(cm,
# cmap="Blues"), write each count with ax.text, and add fig.colorbar.
#
# WHERE YOU USE IT
# A bright diagonal means a good model; bright cells off the diagonal show
# exactly which classes get confused.
#
# RUN IT:  python 02_image-1.py
#

import numpy as np
import matplotlib.pyplot as plt

cm = np.array([[45, 5],
               [8, 42]])
fig, ax = plt.subplots()
im = ax.imshow(cm, cmap="Blues")
ax.set_xticks([0, 1], labels=["Negative", "Positive"])
ax.set_yticks([0, 1], labels=["Negative", "Positive"])
ax.set(xlabel="Predicted", ylabel="Actual", title="Confusion matrix")
for i in range(2):
    for j in range(2):
        ax.text(j, i, str(cm[i, j]), ha="center", va="center")
fig.colorbar(im, ax=ax)
plt.show()
print(cm.trace() / cm.sum())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.87
