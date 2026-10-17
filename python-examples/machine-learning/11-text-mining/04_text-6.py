# -*- coding: utf-8 -*-
# ==========================================================================
# TF–IDF: make distinctive words count more [machine-learning / Text mining]
# ==========================================================================
# WHAT IT IS
# Common words help less in telling documents apart. With the smoothed
# convention used by scikit-learn's default: idf(t) = ln((1 + N)/(1 + df(t)))
# + 1, weight(t, d) = count(t, d) × idf(t), then L2-normalise each row: v / √Σ
# vⱼ². N = 3 documents; "refund" appears in 2 (df = 2): idf = ln(4/3) + 1 ≈
# 1.2877; "payment" in 1: idf = ln(4/2) + 1 ≈ 1.6931. D1 unnormalised =
# [1.2877, 1.6931, 0, 0], length 2.1272, so D1 ≈ [0.6053, 0.7960, 0, 0].
# TF–IDF does not understand synonyms: "refund" and "reimbursement" stay
# different features. Drag N, df and the count.
#
# WHERE YOU USE IT
# Books use different TF and IDF conventions: state your formula before doing
# arithmetic, because another convention gives other (also correct) numbers.
#
# RUN IT:  python 04_text-6.py
#

import numpy as np

docs = [["refund", "payment"], ["refund", "charge"], ["delivery"]]
vocab = ["refund", "payment", "charge", "delivery"]
N = len(docs)
df = np.array([sum(w in d for d in docs) for w in vocab])
idf = np.log((1 + N) / (1 + df)) + 1
counts = np.array([[d.count(w) for w in vocab] for d in docs], dtype=float)
tfidf = counts * idf
norm = tfidf / np.linalg.norm(tfidf, axis=1, keepdims=True)
print(df.tolist(), idf.round(4).tolist())
print(norm.round(4).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [2, 1, 1, 1] [1.2877, 1.6931, 1.6931, 1.6931]
# [[0.6053, 0.796, 0.0, 0.0], [0.6053, 0.0, 0.796, 0.0], [0.0, 0.0, 0.0, 1.0]]
