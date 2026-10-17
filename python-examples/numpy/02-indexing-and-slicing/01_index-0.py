# -*- coding: utf-8 -*-
# ==========================================================================
# Indexing and negative indexes [numpy / Indexing and slicing]
# ==========================================================================
# WHAT IT IS
# Counting starts at 0, exactly like Python lists. a[0] is the first element
# and a[-1] the last. Asking for a position that doesn't exist raises
# IndexError. For arrays this is the same idea, just faster and with more
# dimensions.
#
# WHERE YOU USE IT
# Picking one pixel, one feature or the last time step is an index.
#
# RUN IT:  python 01_index-0.py
#

import numpy as np

a = np.array([10, 20, 30, 40, 50, 60])
print(a[0])
print(a[-1])
print(a[-2])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 10
# 60
# 50
