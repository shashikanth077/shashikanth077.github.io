# -*- coding: utf-8 -*-
# ==========================================================================
# Close your figures [matplotlib / Mistakes and good practice]
# ==========================================================================
# WHAT IT IS
# Every plt.subplots() opens a new figure that stays in memory until you close
# it. A loop that makes hundreds of charts will warn you (more than 20 open)
# and slow down. Call plt.close(fig) after saving, or plt.close("all"). In a
# notebook the chart is freed after the cell displays it.
#
# WHERE YOU USE IT
# Batch jobs that save one chart per customer or experiment must close each
# figure.
#
# RUN IT:  python 02_pitfalls-2.py
#

import matplotlib.pyplot as plt

for i in range(3):
    fig, ax = plt.subplots()
    ax.plot([0, 1], [0, i])
print(len(plt.get_fignums()))
plt.close("all")
print(len(plt.get_fignums()))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 3
# 0
