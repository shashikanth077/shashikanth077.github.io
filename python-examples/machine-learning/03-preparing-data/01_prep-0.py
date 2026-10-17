# -*- coding: utf-8 -*-
# ==========================================================================
# A trustworthy table: the preparation checklist [machine-learning / Preparing
# data]
# ==========================================================================
# WHAT IT IS
# Cleaning is a modelling decision, not tidying. Before training: define X and
# y, find missing values and duplicates, split off a test set, then fit every
# preparation step (fill values, encoders, scalers) on the training rows only
# and apply it to the rest. Typical problems: a missing number (fill with a
# median learned from training data), duplicate emails from one thread (group
# them before splitting), mixed units (cents versus euros), fields not known
# at prediction time, and label errors.
#
# WHERE YOU USE IT
# The fill value must come from the training rows. Recomputing it on the test
# set leaks information.
#
# RUN IT:  python 01_prep-0.py
#

import numpy as np

x = np.array([1, 2, 2, 7])
median = np.median(x)
new = np.array([np.nan, 5])
print(median)
print(np.where(np.isnan(new), median, new).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 2.0
# [2.0, 5.0]
