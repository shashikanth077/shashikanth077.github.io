# -*- coding: utf-8 -*-
# ==========================================================================
# Attention: query, key, value [neural-networks / Translation and attention]
# ==========================================================================
# WHAT IT IS
# Attention combines evidence from several words. The query asks "what do I
# need?", the keys measure how well each word matches, the values carry the
# information. Attention(Q,K,V) = softmax(QKᵀ/√dₖ)·V. Toy: Q = [1,2], K =
# [2,1] → Q·K = 1×2 + 2×1 = 4; scaled 4/√2 = 2.828. With K = [[2,1],[1,0]] and
# V = [[1,4],[3,2]]: scores [2.828, 0.707] → softmax weights [0.893, 0.107] →
# context = 0.893×[1,4] + 0.107×[3,2] = [1.214, 3.786]. The √dₖ keeps the
# scores from growing with the dimension and saturating the softmax.
#
# WHERE YOU USE IT
# Earlier seq2seq attention aligns decoder states with encoder states;
# Transformer self-attention builds Q, K, V from the same sequence and runs in
# parallel.
#
# RUN IT:  python 02_text-1.py
#

import numpy as np

Q = np.array([[1.0, 2.0]])
K = np.array([[2.0, 1.0], [1.0, 0.0]])
V = np.array([[1.0, 4.0], [3.0, 2.0]])
scores = Q @ K.T / np.sqrt(2)
p = np.exp(scores - scores.max(axis=-1, keepdims=True))
p = p / p.sum(axis=-1, keepdims=True)
print(scores.round(3).tolist(), p.round(3).tolist(), (p @ V).round(3).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [[2.828, 0.707]] [[0.893, 0.107]] [[1.214, 3.786]]
