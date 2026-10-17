# -*- coding: utf-8 -*-
# ==========================================================================
# Vocabulary, unknown words and padding [nlp / Preprocessing and tokenization]
# ==========================================================================
# WHAT IT IS
# A model needs a fixed vocabulary. Words outside it become an <UNK> token;
# sequences are padded with <PAD> (ignored by masks) and often wrapped with
# <S> and </S>. Choosing the size is a trade-off: keep the most frequent
# 10,000 words and everything else becomes <UNK>; sub-word vocabularies avoid
# the problem. Build the vocabulary on the training split only — words that
# appear only in test data are exactly the unknowns you must learn to handle.
#
# WHERE YOU USE IT
# Track the <UNK> rate on live text: a rising rate is an early drift alarm.
#
# RUN IT:  python 07_prep-6.py
#

from collections import Counter

train = "the cat sat on the mat the dog sat".split()
counts = Counter(train)
vocab = ["<PAD>", "<UNK>"] + [w for w, c in counts.most_common() if c >= 2]
index = {w: i for i, w in enumerate(vocab)}
encode = lambda s: [index.get(w, index["<UNK>"]) for w in s.split()]
print(vocab, encode("the bird sat"))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ['<PAD>', '<UNK>', 'the', 'sat'] [2, 1, 3]
