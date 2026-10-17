# -*- coding: utf-8 -*-
# ==========================================================================
# Smoothing: giving unseen n-grams a chance [nlp / Language models and
# generation]
# ==========================================================================
# WHAT IT IS
# A new sentence will contain bigrams never seen in training, and a zero
# anywhere makes the whole product zero. Add-one (Laplace) smoothing adds 1 to
# every count: P(w | h) = (count(h w) + 1) / (count(h) + V). With V = 7: the
# unseen "like love" gets (0 + 1)/(2 + 7) = 0.111, while "i love" falls from
# 1/3 to 0.2. Smoothing moves probability mass from seen to unseen events.
# Better schemes (Kneser–Ney, back-off, interpolation) redistribute it more
# cleverly.
#
# WHERE YOU USE IT
# Add-one is too generous for large vocabularies; Kneser–Ney is the classic
# strong n-gram smoother.
#
# RUN IT:  python 03_lm-2.py
#

import math
from collections import Counter

import numpy as np

text = "<s> i like nlp </s> <s> i like cats </s> <s> i love nlp </s>".split()
bi = Counter(zip(text, text[1:]))
uni = Counter(text)
V = len(set(text))
p = lambda a, b: (bi[(a, b)] + 1) / (uni[a] + V)
print(V, round(p("like", "love"), 4), round(p("i", "love"), 4), round(p("like", "nlp"), 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 7 0.1111 0.2 0.2222
