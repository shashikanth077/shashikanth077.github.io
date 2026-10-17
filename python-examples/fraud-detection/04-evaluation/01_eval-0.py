# -*- coding: utf-8 -*-
# ==========================================================================
# Confusion matrix, precision and recall [fraud-detection / Evaluation]
# ==========================================================================
# WHAT IT IS
# Every decision lands in one of four boxes: true positive (fraud, blocked),
# false positive (good, blocked), false negative (fraud, missed) and true
# negative (good, approved). From them: recall = TP / (TP + FN) — the share of
# fraud caught; precision = TP / (TP + FP) — the share of blocks that were
# really fraud; the F1 score is their harmonic mean (it punishes a weak side).
# Recall alone can be gamed by blocking everything; precision alone by
# blocking almost nothing. Fraud teams also quote the false-positive ratio
# (good customers blocked per fraud caught): a ratio of 10 means ten genuine
# customers are disturbed for each fraud stopped. Move the counts to see the
# trade.
#
# WHERE YOU USE IT
# Always report recall and precision together at the operating threshold you
# actually deploy.
#
# RUN IT:  python 01_eval-0.py
#

tp, fp, fn, tn = 40, 10, 20, 9930
precision = tp / (tp + fp)
recall = tp / (tp + fn)
f1 = 2 * precision * recall / (precision + recall)
print("precision:", round(precision, 3))
print("recall   :", round(recall, 3))
print("F1       :", round(f1, 3))
print("good customers blocked per fraud caught:", round(fp / tp, 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# precision: 0.8
# recall   : 0.667
# F1       : 0.727
# good customers blocked per fraud caught: 0.25
