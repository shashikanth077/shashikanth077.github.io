# -*- coding: utf-8 -*-
# ==========================================================================
# Extractive QA: predicting the answer span [nlp / Question answering and
# dialog]
# ==========================================================================
# WHAT IT IS
# A reader model scores every token as a possible start and end of the answer;
# softmax over positions gives P(start = i) and P(end = j). The answer is the
# span (i ≤ j) with the highest product. Tokens "The tower is in Vilnius":
# start scores [0.1, 0.2, 3.0, 0.5, 0.1] peak at token 3 (79.8%), end scores
# [0, 0.1, 0.4, 2.5, 0.3] peak at token 4 (71.1%): best span (2, 3) with
# probability 0.568 in the 0-indexed toy. Constraints (i ≤ j, maximum length)
# and a "no answer" option complete the picture.
#
# WHERE YOU USE IT
# Reader models are usually pretrained encoders such as BERT with two small
# linear heads.
#
# RUN IT:  python 02_qa-1.py
#

import numpy as np

ss = np.array([0.1, 0.2, 3.0, 0.5, 0.1])
es = np.array([0.0, 0.1, 0.4, 2.5, 0.3])
sp, ep = np.exp(ss) / np.exp(ss).sum(), np.exp(es) / np.exp(es).sum()
best = max((sp[i] * ep[j], i, j) for i in range(5) for j in range(i, 5))
print(sp.round(3).tolist(), ep.round(3).tolist())
print(round(float(best[0]), 3), best[1], best[2])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0.044, 0.049, 0.798, 0.066, 0.044] [0.058, 0.065, 0.087, 0.711, 0.079]
# 0.568 2 3
