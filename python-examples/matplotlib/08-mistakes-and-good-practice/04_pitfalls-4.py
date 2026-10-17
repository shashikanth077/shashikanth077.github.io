# -*- coding: utf-8 -*-
# ==========================================================================
# Backends: why nothing appears [matplotlib / Mistakes and good practice]
# ==========================================================================
# WHAT IT IS
# A backend decides where the chart goes. Interactive backends open a window
# (plt.show()); in Jupyter use %matplotlib inline; servers and scheduled jobs
# without a screen use matplotlib.use("Agg") and save files instead. If a
# script runs and nothing opens, you are usually on a non-interactive backend
# — save with fig.savefig.
#
# WHERE YOU USE IT
# Web apps, CI pipelines and cron jobs have no display. Pick Agg and write
# images to disk.
#
# RUN IT:  python 04_pitfalls-4.py
#

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

fig, ax = plt.subplots()
ax.plot([1, 2, 3])
fig.savefig("chart.png")
print(matplotlib.get_backend())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# Agg
