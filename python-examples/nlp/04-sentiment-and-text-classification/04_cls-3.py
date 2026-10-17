# -*- coding: utf-8 -*-
# ==========================================================================
# Evaluating a classifier: precision, recall, F1 [nlp / Sentiment and text
# classification]
# ==========================================================================
# WHAT IT IS
# Accuracy hides imbalance, so report per-class numbers. For the positive
# class: precision = TP/(TP+FP), recall = TP/(TP+FN), F1 = 2PR/(P+R). A
# sentiment model on 100 reviews gives TP = 40, FP = 10, FN = 20, TN = 30:
# precision 0.80, recall 0.667, F1 0.727, accuracy 0.70. For several classes
# average them: macro (each class equal), micro (pool all decisions) or
# weighted (by class size). Always compare to a trivial baseline such as
# "predict the majority class".
#
# WHERE YOU USE IT
# Pick the metric from the cost of errors: missing a complaint (recall) versus
# flagging a harmless message (precision).
#
# RUN IT:  python 04_cls-3.py
#

tp, fp, fn, tn = 40, 10, 20, 30
p, r = tp / (tp + fp), tp / (tp + fn)
print(round(p, 3), round(r, 3), round(2 * p * r / (p + r), 3), (tp + tn) / (tp + fp + fn + tn))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.8 0.667 0.727 0.7
