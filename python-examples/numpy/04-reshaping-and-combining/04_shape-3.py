# -*- coding: utf-8 -*-
# ==========================================================================
# Adding and removing dimensions [numpy / Reshaping and combining]
# ==========================================================================
# WHAT IT IS
# Models expect a particular number of dimensions. a.reshape(1, -1) or
# a[np.newaxis, :] makes a row of shape (1, n); a[:, np.newaxis] makes a
# column (n, 1); np.squeeze removes size-1 dimensions. The column form is what
# lets broadcasting build outer sums and distance tables.
#
# WHERE YOU USE IT
# A single image becomes a batch of one with img[np.newaxis]; a label vector
# becomes a column with y[:, None].
#
# RUN IT:  python 04_shape-3.py
#

import numpy as np

a = np.array([10, 20, 30])
print(a.shape)
print(a.reshape(1, -1).shape)
print(a[:, np.newaxis].shape)
print(a[:, None] + a[None, :])
print(np.squeeze(a.reshape(1, 3)).shape)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# (3,)
# (1, 3)
# (3, 1)
# [[20 30 40]
#  [30 40 50]
#  [40 50 60]]
# (3,)
