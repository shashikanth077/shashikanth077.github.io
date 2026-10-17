# -*- coding: utf-8 -*-
# ==========================================================================
# Figure size, DPI and saving [matplotlib / Readable, honest charts]
# ==========================================================================
# WHAT IT IS
# figsize=(width, height) is in inches and dpi is dots per inch, so the saved
# image has width × dpi by height × dpi pixels. fig.savefig("chart.png",
# dpi=200, bbox_inches="tight") writes the file — call it before plt.show() in
# a script, because some backends clear the figure after showing. Use a high
# dpi (150–300) for print and 100 for the web. PNG is raster; SVG and PDF stay
# sharp at any size.
#
# WHERE YOU USE IT
# A blurry chart in a slide deck is a DPI problem. Save a PNG at dpi=200 or an
# SVG for documents.
#
# RUN IT:  python 06_style-5.py
#

import matplotlib.pyplot as plt
import matplotlib.image as mpimg

fig, ax = plt.subplots(figsize=(8, 4))
ax.plot([1, 2, 3, 4], [3, 5, 4, 8])
print(fig.get_size_inches(), fig.dpi)
fig.savefig("chart.png", dpi=200)
print(mpimg.imread("chart.png").shape)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [8. 4.] 100.0
# (800, 1600, 4)
