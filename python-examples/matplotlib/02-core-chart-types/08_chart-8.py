# -*- coding: utf-8 -*-
# ==========================================================================
# Bins change the story [matplotlib / Core chart types]
# ==========================================================================
# WHAT IT IS
# The same data can look very different depending on bins. Too few bins hide
# the shape; too many make it jagged and noisy. There is no single right
# number: try several (a common start is 10–30 for hundreds of points) and
# keep the one that shows the real shape without chasing noise. You can also
# give exact edges, bins=[0, 50, 70, 100].
#
# WHERE YOU USE IT
# A histogram that looks "bimodal" with 30 bins may look flat with 5. Always
# check more than one bin count before concluding anything.
#
# RUN IT:  python 08_chart-8.py
#

import numpy as np

marks = [35, 42, 48, 50, 52, 55, 58, 60, 61, 64, 66, 68, 70, 74, 76, 80, 82, 83, 88, 92]
for bins in (3, 6, 12):
    counts, edges = np.histogram(marks, bins=bins)
    print(bins, counts)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 3 [5 8 7]
# 6 [2 3 4 4 4 3]
# 12 [1 1 1 2 2 2 3 1 2 2 1 2]
