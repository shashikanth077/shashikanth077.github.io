# -*- coding: utf-8 -*-
# ==========================================================================
# Text classification: route a ticket to a known team [machine-learning / Text
# mining]
# ==========================================================================
# WHAT IT IS
# Training examples teach the model the category names. The workflow: text +
# human labels → training split → fit the vectoriser AND classifier → validate
# settings → evaluate untouched test data → predict a new ticket. Multiclass:
# one team per ticket (Billing OR Delivery OR Account). Multilabel: a ticket
# can be BOTH Billing AND Delivery. Binary: urgent or not. These definitions
# decide the output layer, the labelling rules and the evaluation. Models:
# multinomial Naive Bayes (word frequencies per class), logistic regression
# (word weights add to a score), linear SVM, kNN, trees (evaluate them on
# sparse text rather than assume they win). Logistic example: z = −1 +
# 2·I("refund"); a message with "refund" has z = 1 and p = σ(1) ≈ 0.731.
#
# WHERE YOU USE IT
# A route is a prediction, not an action mandate: add an abstain /
# manual-review path for ambiguous or out-of-domain tickets.
#
# RUN IT:  python 08_text-11.py
#

import numpy as np

sigmoid = lambda z: 1 / (1 + np.exp(-z))
for has_refund in (0, 1):
    z = -1 + 2 * has_refund
    print(has_refund, z, round(float(sigmoid(z)), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0 -1 0.269
# 1 1 0.731
