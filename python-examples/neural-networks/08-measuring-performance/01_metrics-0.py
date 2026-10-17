# -*- coding: utf-8 -*-
# ==========================================================================
# The confusion matrix: four possible outcomes [neural-networks / Measuring
# performance]
# ==========================================================================
# WHAT IT IS
# Every prediction has an actual label and a predicted label. With spam as the
# positive class: TP spam caught, FN spam missed (let into the inbox), FP
# normal mail wrongly flagged, TN normal mail kept. "True/false" says whether
# the prediction was right; "positive/negative" says what was predicted. Eight
# toy emails: A,E,G are spam caught (TP=3); B,F,H normal kept (TN=3); C spam
# missed (FN=1); D normal flagged (FP=1). Check the axes: this guide uses rows
# = actual, columns = predicted; scikit-learn's [0,1] order shows
# [[TN,FP],[FN,TP]].
#
# WHERE YOU USE IT
# Always state which class is "positive" before quoting any metric.
#
# RUN IT:  python 01_metrics-0.py
#

import numpy as np

actual = np.array([1, 0, 1, 0, 1, 0, 1, 0])
pred   = np.array([1, 0, 0, 1, 1, 0, 1, 0])
tp = int(((actual == 1) & (pred == 1)).sum())
tn = int(((actual == 0) & (pred == 0)).sum())
fp = int(((actual == 0) & (pred == 1)).sum())
fn = int(((actual == 1) & (pred == 0)).sum())
print(tp, tn, fp, fn, tp + tn + fp + fn)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 3 3 1 1 8
