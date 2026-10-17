# -*- coding: utf-8 -*-
# ==========================================================================
# Attention: looking back at the source [nlp / Sequence-to-sequence and
# transformers]
# ==========================================================================
# WHAT IT IS
# Attention lets the decoder compute, at every output step, a weighted average
# of all encoder states, with weights from a softmax over match scores between
# the current decoder state (query) and each source state (key). Scaled
# dot-product form: softmax(QKᵀ/√d)V. If the scores for "I love cats" are
# [0.5, 3.0, 1.0] while producing "aime", the weights are [0.07, 0.82, 0.11]:
# the decoder mostly reads "love". The weights also give a readable alignment
# between source and target words.
#
# WHERE YOU USE IT
# The neural-networks track derives attention numerically; here the point is
# what it buys translation: no fixed-length bottleneck.
#
# RUN IT:  python 02_s2s-1.py
#

import numpy as np

scores = np.array([0.5, 3.0, 1.0])
w = np.exp(scores - scores.max())
w /= w.sum()
print(w.round(3).tolist(), round(float(w.sum()), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0.067, 0.821, 0.111] 1.0
