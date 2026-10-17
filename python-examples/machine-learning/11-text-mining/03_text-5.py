# -*- coding: utf-8 -*-
# ==========================================================================
# Bag of words: text as a table [machine-learning / Text mining]
# ==========================================================================
# WHAT IT IS
# A fixed vocabulary gives every message the same coordinate system. For the
# mini-corpus D1 = "refund payment", D2 = "refund charge", D3 = "delivery" and
# the column order [refund, payment, charge, delivery]: D1 = [1, 1, 0, 0], D2
# = [1, 0, 1, 0], D3 = [0, 0, 0, 1]; "refund refund payment" is [2, 1, 0, 0]
# (binary presence would give [1, 1, 0, 0]). What is lost: word order — "dog
# bites person" and "person bites dog" have identical counts (n-grams recover
# some). Most entries of a large document–term matrix are zero, so use sparse
# storage.
#
# WHERE YOU USE IT
# Fit the vocabulary on training text only; unknown words are ignored, which
# can produce an all-zero vector.
#
# RUN IT:  python 03_text-5.py
#

import numpy as np

vocab = ["refund", "payment", "charge", "delivery"]
docs = ["refund payment", "refund charge", "delivery", "refund refund payment"]
matrix = np.array([[d.split().count(w) for w in vocab] for d in docs])
print(matrix.tolist())
print((matrix > 0).astype(int).tolist()[-1])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [[1, 1, 0, 0], [1, 0, 1, 0], [0, 0, 0, 1], [2, 1, 0, 0]]
# [1, 1, 0, 0]
