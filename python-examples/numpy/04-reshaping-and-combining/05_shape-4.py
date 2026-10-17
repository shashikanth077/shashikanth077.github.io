# -*- coding: utf-8 -*-
# ==========================================================================
# concatenate and stack [numpy / Reshaping and combining]
# ==========================================================================
# WHAT IT IS
# np.concatenate([x, y]) joins arrays along an EXISTING axis: two (2,) arrays
# become one (4,). np.stack([x, y]) creates a NEW axis: two (2,) arrays become
# a (2, 2) table. vstack and hstack are shortcuts for stacking rows or
# columns.
#
# WHERE YOU USE IT
# Combining feature columns, appending a new batch, or building a table from
# several vectors all use these.
#
# RUN IT:  python 05_shape-4.py
#

import numpy as np

x = np.array([1, 2])
y = np.array([3, 4])
print(np.concatenate([x, y]))
print(np.stack([x, y]))
print(np.vstack([x, y]))
print(np.hstack([x, y]))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [1 2 3 4]
# [[1 2]
#  [3 4]]
# [[1 2]
#  [3 4]]
# [1 2 3 4]
