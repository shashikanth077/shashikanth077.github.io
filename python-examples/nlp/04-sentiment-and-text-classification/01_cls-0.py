# -*- coding: utf-8 -*-
# ==========================================================================
# Text classification: the task and its variants [nlp / Sentiment and text
# classification]
# ==========================================================================
# WHAT IT IS
# Text classification assigns a label to a text. Variants: binary (spam / not
# spam, positive / negative), multi-class (one of many topics), multi-label
# (several tags at once: a news item can be both "sport" and "politics") and
# ordinal (1–5 stars). Sentiment analysis is the best-known case: is the
# opinion positive, negative or neutral? Each variant changes the output layer
# and the loss: sigmoid + binary cross-entropy, softmax + categorical
# cross-entropy, independent sigmoids per label.
#
# WHERE YOU USE IT
# Define the label scheme with the people who will use it, and measure how
# often two human annotators agree: that is your ceiling.
#
# RUN IT:  python 01_cls-0.py
#

import numpy as np

def softmax(z):
    e = np.exp(z - z.max())
    return e / e.sum()

z = np.array([2.0, 1.0, -1.0])
print(softmax(z).round(3).tolist(), round(float(softmax(z).sum()), 3))
print((1 / (1 + np.exp(-z))).round(3).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0.705, 0.259, 0.035] 1.0
# [0.881, 0.731, 0.269]
