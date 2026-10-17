# -*- coding: utf-8 -*-
# ==========================================================================
# Arrays, dimensions and shape [numpy / Arrays: the basics]
# ==========================================================================
# WHAT IT IS
# Think of dimensions as the directions you need to locate a value. 1D: one
# position (a vector). 2D: row and column (a matrix). 3D: layer, row, column.
# The shape tuple lists the size along each direction, ndim counts them and
# size is the total number of values.
#
# WHERE YOU USE IT
# A dataset is a 2D array (rows = examples, columns = features); a batch of
# images is 4D. Reading shapes fluently is the most useful NumPy skill.
#
# RUN IT:  python 03_start-2.py
#

import numpy as np

one_d = np.array([70, 85, 90])
two_d = np.array([[70, 85, 90], [80, 75, 95]])
print(one_d.ndim, one_d.shape)
print(two_d.ndim, two_d.shape)
print(two_d.size)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1 (3,)
# 2 (2, 3)
# 6
