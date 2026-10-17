# -*- coding: utf-8 -*-
# ==========================================================================
# One-hot encoding and accuracy [numpy / NumPy in real AI work]
# ==========================================================================
# WHAT IT IS
# One-hot encoding turns class numbers into rows of mostly zeros with a single
# 1: np.eye(3)[labels] picks rows of the identity matrix. Accuracy is the
# fraction of predictions equal to the labels: (pred == labels).mean() — True
# counts as 1 and False as 0.
#
# WHERE YOU USE IT
# Classification targets are one-hot encoded for cross-entropy; accuracy is
# the first metric you compute.
#
# RUN IT:  python 08_ai-7.py
#

import numpy as np

labels = np.array([0, 2, 1])
onehot = np.eye(3)[labels]
print(onehot)
pred = np.array([0, 2, 2])
print((pred == labels).mean())
print(pred == labels)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [[1. 0. 0.]
#  [0. 0. 1.]
#  [0. 1. 0.]]
# 0.6666666666666666
# [ True  True False]
