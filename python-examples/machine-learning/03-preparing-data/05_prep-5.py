# -*- coding: utf-8 -*-
# ==========================================================================
# Imbalanced data: choosing a remedy [machine-learning / Preparing data]
# ==========================================================================
# WHAT IT IS
# When one class is rare, accuracy is dominated by the majority and a lazy
# model looks great. First choose the evaluation goal (rare-class recall?
# precision?) and compare with the trivial baseline. Then remedies: collect
# more real minority examples, use class weights (errors on the rare class
# cost more), randomly oversample the minority or undersample the majority,
# generate synthetic points with SMOTE, or move the decision threshold. None
# creates information from nothing.
#
# WHERE YOU USE IT
# Apply resampling INSIDE each training fold and never to validation or test
# rows.
#
# RUN IT:  python 05_prep-5.py
#

import numpy as np

y = np.array([0] * 95 + [1] * 5)
counts = np.bincount(y)
weights = len(y) / (len(counts) * counts)
print(counts.tolist(), weights.round(3).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [95, 5] [0.526, 10.0]
