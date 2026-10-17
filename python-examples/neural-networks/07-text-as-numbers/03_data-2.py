# -*- coding: utf-8 -*-
# ==========================================================================
# One-hot and multi-hot encoding [neural-networks / Text as numbers]
# ==========================================================================
# WHAT IT IS
# A one-hot vector represents ONE token: all zeros with a single 1 at its
# index (vocabulary of 12 → length 12). A multi-hot vector represents a WHOLE
# review: mark 1 for every word that appears anywhere, 0 otherwise. The
# lecture's results[i, sequence] = 1 makes a multi-hot bag-of-words vector. It
# ignores word order and counts but feeds nicely into a Dense network: a
# 10,000-word vocabulary gives each review a 10,000-long 0/1 vector.
#
# WHERE YOU USE IT
# Multi-hot vectors are huge and sparse and carry no similarity between words
# — the motivation for embeddings.
#
# RUN IT:  python 03_data-2.py
#

import numpy as np

vocab_size = 12
tokens = [3, 5, 5, 9]
one_hot = np.eye(vocab_size, dtype=int)[5]
multi_hot = np.zeros(vocab_size, dtype=int)
multi_hot[tokens] = 1
print(one_hot.tolist())
print(multi_hot.tolist(), int(multi_hot.sum()))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0]
# [0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0] 3
