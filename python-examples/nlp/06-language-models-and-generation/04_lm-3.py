# -*- coding: utf-8 -*-
# ==========================================================================
# Perplexity: how surprised is the model? [nlp / Language models and
# generation]
# ==========================================================================
# WHAT IT IS
# Perplexity = P(test text)^(−1/N) — the inverse probability, normalised by
# length — is the standard intrinsic score: lower is better. It is the
# effective number of equally likely choices the model is hesitating between.
# Smoothed bigram on "<s> i like nlp </s>": the four step probabilities
# multiply to 0.00889, so over N = 4 steps the perplexity is 3.26. A model
# that guessed uniformly over V = 7 words would have perplexity 7. Perplexity
# equals exp(cross-entropy), linking language modelling to the loss of the
# neural networks track.
#
# WHERE YOU USE IT
# Compare perplexities only on the same test text and the same tokenization.
#
# RUN IT:  python 04_lm-3.py
#

import math
from collections import Counter

import numpy as np

text = "<s> i like nlp </s> <s> i like cats </s> <s> i love nlp </s>".split()
bi = Counter(zip(text, text[1:]))
uni = Counter(text)
V = len(set(text))
p = lambda a, b: (bi[(a, b)] + 1) / (uni[a] + V)
s = "<s> i like nlp </s>".split()
probs = [p(a, b) for a, b in zip(s, s[1:])]
prod = float(np.prod(probs))
print([round(x, 3) for x in probs], round(prod, 5), round(prod ** (-1 / len(probs)), 3))
print(round((0.25 ** 6) ** (-1 / 6), 3), round(math.exp(-np.mean(np.log(probs))), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0.4, 0.3, 0.222, 0.333] 0.00889 3.257
# 4.0 3.257
