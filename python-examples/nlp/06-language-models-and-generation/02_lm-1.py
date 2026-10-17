# -*- coding: utf-8 -*-
# ==========================================================================
# Bigram models from counts [nlp / Language models and generation]
# ==========================================================================
# WHAT IT IS
# The Markov assumption keeps only the last n − 1 words. A bigram model
# estimates P(wᵢ | wᵢ₋₁) = count(wᵢ₋₁ wᵢ) / count(wᵢ₋₁). Corpus: "<s> i like
# nlp </s>", "<s> i like cats </s>", "<s> i love nlp </s>". "i" occurs 3
# times, followed by "like" twice and "love" once: P(like | i) = 2/3, P(love |
# i) = 1/3. "like" is followed by "nlp" and "cats" once each: P(nlp | like) =
# 1/2. Longer histories (trigrams …) are sharper but need far more data.
#
# WHERE YOU USE IT
# Counts are maximum-likelihood estimates; they give zero to anything unseen,
# which is why smoothing exists.
#
# RUN IT:  python 02_lm-1.py
#

import math
from collections import Counter

import numpy as np

text = "<s> i like nlp </s> <s> i like cats </s> <s> i love nlp </s>".split()
bi = Counter(zip(text, text[1:]))
uni = Counter(text)
V = len(set(text))
print(bi[("i", "like")], uni["i"], round(bi[("i", "like")] / uni["i"], 3))
print(round(bi[("like", "nlp")] / uni["like"], 3), round(bi[("like", "love")] / uni["like"], 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 2 3 0.667
# 0.5 0.0
