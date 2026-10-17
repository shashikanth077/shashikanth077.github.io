# -*- coding: utf-8 -*-
# ==========================================================================
# Word2vec: learning vectors from context [nlp / Text representations]
# ==========================================================================
# WHAT IT IS
# The distributional idea: "you shall know a word by the company it keeps".
# Skip-gram trains a network to predict the words around a centre word; CBOW
# predicts the centre from its context. Window 2 on "the quick brown fox
# jumps" with centre "brown" gives the training pairs (brown → the), (brown →
# quick), (brown → fox), (brown → jumps). After training on millions of pairs
# the hidden weights are the embeddings. GloVe reaches similar vectors by
# factorising co-occurrence counts.
#
# WHERE YOU USE IT
# Negative sampling (a few random wrong words per pair) makes training cheap
# enough for huge corpora.
#
# RUN IT:  python 04_repr-3.py
#

words = "the quick brown fox jumps".split()
window = 2
pairs = [(words[i], words[j]) for i in range(len(words)) for j in range(max(0, i - window), min(len(words), i + window + 1)) if i != j]
print(len(pairs))
print([p for p in pairs if p[0] == "brown"])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 14
# [('brown', 'the'), ('brown', 'quick'), ('brown', 'fox'), ('brown', 'jumps')]
