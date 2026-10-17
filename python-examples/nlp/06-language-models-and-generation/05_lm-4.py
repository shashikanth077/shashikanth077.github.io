# -*- coding: utf-8 -*-
# ==========================================================================
# Neural language models and the softmax [nlp / Language models and
# generation]
# ==========================================================================
# WHAT IT IS
# A neural language model replaces counting with a network: embed the history,
# run it through an RNN or transformer, and a final layer produces one logit
# per vocabulary word; softmax turns them into P(next word). Training
# minimises cross-entropy −ln P(true next word), exactly the loss from the
# neural-networks track. Because embeddings are shared, "I adopted a cat"
# teaches it about "dog". Logits [3, 2, 1, 0] give probabilities 0.644, 0.237,
# 0.087, 0.032.
#
# WHERE YOU USE IT
# Large vocabularies make the softmax expensive; sub-word tokenization keeps
# the vocabulary near 30–100 thousand pieces.
#
# RUN IT:  python 05_lm-4.py
#

import numpy as np

z = np.array([3.0, 2.0, 1.0, 0.0])
p = np.exp(z - z.max())
p /= p.sum()
print(p.round(3).tolist(), round(float(-np.log(p[1])), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0.644, 0.237, 0.087, 0.032] 1.44
