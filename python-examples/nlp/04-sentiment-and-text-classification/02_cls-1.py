# -*- coding: utf-8 -*-
# ==========================================================================
# Naive Bayes for sentiment, by hand [nlp / Sentiment and text classification]
# ==========================================================================
# WHAT IT IS
# Naive Bayes picks the class with the largest P(class) × Π P(word | class),
# assuming words are independent given the class. Training set: 3 positive and
# 3 negative reviews, vocabulary of 9 words, 9 positive and 7 negative word
# tokens. With Laplace smoothing P(w | c) = (count + 1) / (tokens_c + V). Test
# "great acting boring": log-score positive −7.167, negative −7.219 →
# posterior 51.3% positive. The independence assumption is false, yet the
# classifier is a strong baseline; working in log space avoids underflow.
#
# WHERE YOU USE IT
# Smoothing is essential: one unseen word would otherwise zero the whole
# product.
#
# RUN IT:  python 02_cls-1.py
#

import math
from collections import Counter

import numpy as np

pos = ["great movie", "loved the acting", "great acting loved it"]
neg = ["boring movie", "awful plot", "boring awful acting"]
V = sorted({w for d in pos + neg for w in d.split()})
cp = Counter(w for d in pos for w in d.split())
cn = Counter(w for d in neg for w in d.split())
total_p, total_n = sum(cp.values()), sum(cn.values())
test = "great acting boring".split()
lp = math.log(0.5) + sum(math.log((cp[w] + 1) / (total_p + len(V))) for w in test)
ln = math.log(0.5) + sum(math.log((cn[w] + 1) / (total_n + len(V))) for w in test)
print(len(V), total_p, total_n)
print(round(lp, 3), round(ln, 3), round(math.exp(lp) / (math.exp(lp) + math.exp(ln)), 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 9 9 7
# -7.167 -7.219 0.513
