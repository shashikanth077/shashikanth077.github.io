# -*- coding: utf-8 -*-
# ==========================================================================
# N-grams: remembering a little context [nlp / Preprocessing and tokenization]
# ==========================================================================
# WHAT IT IS
# An n-gram is a run of n consecutive tokens: unigrams are single words,
# bigrams pairs ("New York"), trigrams triples. Counting them captures phrases
# that single words miss and is the basis of classic language models and of
# features such as "not good". The price is size: a vocabulary of V words has
# V² possible bigrams and V³ trigrams, almost all of them never seen. The
# sentence "the cat sat on the mat" has 6 unigrams, 5 bigrams and 4 trigrams.
#
# WHERE YOU USE IT
# Character n-grams are robust to misspellings and useful for language
# identification.
#
# RUN IT:  python 05_prep-4.py
#

words = "the cat sat on the mat".split()
ngrams = lambda n: list(zip(*[words[i:] for i in range(n)]))
print(len(ngrams(1)), len(ngrams(2)), len(ngrams(3)))
print(ngrams(2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 6 5 4
# [('the', 'cat'), ('cat', 'sat'), ('sat', 'on'), ('on', 'the'), ('the', 'mat')]
