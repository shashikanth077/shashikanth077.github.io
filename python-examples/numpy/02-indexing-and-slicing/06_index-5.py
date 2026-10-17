# -*- coding: utf-8 -*-
# ==========================================================================
# np.where: choose by condition [numpy / Indexing and slicing]
# ==========================================================================
# WHAT IT IS
# np.where(cond, a, b) builds a new array by picking a where the condition is
# True and b elsewhere — an if/else for a whole array. With only the
# condition, np.where(cond) returns the positions where it is True.
#
# WHERE YOU USE IT
# Replacing negatives with 0, turning probabilities into class labels, or
# flagging outliers all use np.where.
#
# RUN IT:  python 06_index-5.py
#

import numpy as np

marks = np.array([35, 48, 50, 67, 91])
print(np.where(marks >= 50, "Pass", "Fail"))
print(np.where(marks >= 50)[0])
print(np.where(marks < 50, 0, marks))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ['Fail' 'Fail' 'Pass' 'Pass' 'Pass']
# [2 3 4]
# [ 0  0 50 67 91]
