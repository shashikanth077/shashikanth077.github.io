# -*- coding: utf-8 -*-
# ==========================================================================
# Confusion matrix, precision, recall and F1 [scikit-learn / Evaluating
# models]
# ==========================================================================
# WHAT IT IS
# The confusion matrix counts four outcomes: true positives, false positives,
# false negatives, true negatives. From them: precision = of the cases I
# flagged, how many were real? recall = of the real cases, how many did I
# find? F1 is their harmonic mean. In scikit-learn rows are the actual classes
# and columns the predictions: confusion_matrix(y_true, y_pred). Drag the
# mistakes and watch each score react differently.
#
# WHERE YOU USE IT
# Choose by cost: missing a disease (false negative) calls for recall;
# flagging innocent customers (false positive) calls for precision.
#
# RUN IT:  python 02_eval-1.py
#

from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, precision_score, recall_score

y_true = [1, 1, 1, 1, 0, 0, 0, 0, 0, 0]
y_pred = [1, 1, 0, 0, 0, 0, 0, 0, 1, 0]
print(confusion_matrix(y_true, y_pred).tolist())
print(accuracy_score(y_true, y_pred), round(precision_score(y_true, y_pred), 3),
      recall_score(y_true, y_pred), round(f1_score(y_true, y_pred), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [[5, 1], [2, 2]]
# 0.7 0.667 0.5 0.571
