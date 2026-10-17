# -*- coding: utf-8 -*-
# ==========================================================================
# Subplots: several charts in one figure [matplotlib / Subplots and layout]
# ==========================================================================
# WHAT IT IS
# fig, axes = plt.subplots(1, 2) makes one row of two charts; you get one
# Figure and an array of Axes, so axes[0] is the left chart and axes[1] the
# right. Think of a dashboard: each panel has its own data, title and labels.
# Add figsize=(10, 4) to give them room.
#
# WHERE YOU USE IT
# Training loss and accuracy side by side, a feature before and after scaling,
# one panel per model — all subplots.
#
# RUN IT:  python 01_layout-0.py
#

import matplotlib.pyplot as plt

epochs = [1, 2, 3, 4, 5]
loss = [0.9, 0.65, 0.44, 0.30, 0.23]
accuracy = [0.55, 0.66, 0.76, 0.84, 0.89]

fig, axes = plt.subplots(1, 2, figsize=(10, 4))
axes[0].plot(epochs, loss, marker="o")
axes[0].set_title("Training loss")
axes[1].plot(epochs, accuracy, marker="o")
axes[1].set_title("Training accuracy")
fig.tight_layout()
plt.show()
print(axes.shape)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# (2,)
