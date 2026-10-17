# -*- coding: utf-8 -*-
# ==========================================================================
# What a loss function is — and how it differs from a metric [neural-networks
# / Loss functions]
# ==========================================================================
# WHAT IT IS
# A loss function compares a prediction ŷ with the target y and returns one
# non-negative number: small when the match is good. Training changes the
# weights to reduce the average loss; the gradients of the loss drive every
# update. A metric (accuracy, precision, recall) is what you REPORT. They can
# disagree: for a true label of 1, model A predicts p = 0.51 and model B
# predicts p = 0.99. At threshold 0.5 both are correct (equal accuracy), but
# their losses are −ln 0.51 = 0.6733 and −ln 0.99 = 0.0101 — B is far more
# confident in the right answer.
#
# WHERE YOU USE IT
# Loss measures confidence as well as correctness, which is why it gives
# useful gradients; accuracy is flat between decisions.
#
# RUN IT:  python 01_loss-0.py
#

import numpy as np

for p in (0.51, 0.99):
    print(p, int(p >= 0.5), round(float(-np.log(p)), 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.51 1 0.6733
# 0.99 1 0.0101
