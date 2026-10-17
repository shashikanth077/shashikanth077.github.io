# -*- coding: utf-8 -*-
# ==========================================================================
# Horizontal and grouped bars [matplotlib / Core chart types]
# ==========================================================================
# WHAT IT IS
# ax.barh draws horizontal bars — use it when category names are long, so they
# don't collide along the bottom. To compare two series per category, draw two
# ax.bar calls shifted left and right of each tick by half a width, with the
# positions made by np.arange. Add a legend so the reader knows which colour
# is which.
#
# WHERE YOU USE IT
# Comparing models on several metrics (accuracy, precision, recall) is a
# grouped bar chart.
#
# RUN IT:  python 04_chart-4.py
#

import numpy as np
import matplotlib.pyplot as plt

models = ["Tree", "Forest", "Neural net"]
precision = [0.81, 0.88, 0.91]
recall = [0.75, 0.84, 0.86]

x = np.arange(len(models))
width = 0.35
fig, ax = plt.subplots()
ax.bar(x - width / 2, precision, width, label="Precision")
ax.bar(x + width / 2, recall, width, label="Recall")
ax.set_xticks(x, labels=models)
ax.legend()
plt.show()
print(x - width / 2)
print(x + width / 2)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [-0.175  0.825  1.825]
# [0.175 1.175 2.175]
