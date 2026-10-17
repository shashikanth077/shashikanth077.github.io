# -*- coding: utf-8 -*-
# ==========================================================================
# Axis limits and honest scales [matplotlib / Readable, honest charts]
# ==========================================================================
# WHAT IT IS
# Matplotlib picks axis limits automatically; ax.set_ylim(low, high) overrides
# them. Be careful: a bar chart whose axis does not start at zero exaggerates
# tiny differences. Two values of 50 and 52 are nearly equal — but cut the
# axis at 48 and one bar looks four times taller. Drag the slider and watch
# the same data change its message.
#
# WHERE YOU USE IT
# Truncated axes are the commonest misleading chart. For bars, start at zero;
# for lines it can be fine to zoom in, but label it clearly.
#
# RUN IT:  python 04_style-3.py
#

import matplotlib.pyplot as plt

fig, ax = plt.subplots()
ax.bar(["A", "B"], [50, 52])
ax.set_ylim(48, 55)          # exaggerates the gap — try ax.set_ylim(0, 55)
plt.show()
print(ax.get_ylim())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# (np.float64(48.0), np.float64(55.0))
