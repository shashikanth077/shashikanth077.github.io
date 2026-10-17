# -*- coding: utf-8 -*-
# ==========================================================================
# Chunking: size and overlap [generative-ai / Retrieval-augmented generation]
# ==========================================================================
# WHAT IT IS
# Documents are split into chunks small enough to be specific and large enough
# to be understood. A chunk of 200–800 tokens is a common range; sentence- or
# section-aware splitting beats cutting mid-sentence. Overlap repeats the end
# of one chunk at the start of the next so an answer on a boundary is not
# lost. A 10,000-token document with chunks of 500 and overlap 100 (stride
# 400) gives 1 + ⌈(10,000 − 500)/400⌉ = 25 chunks, about 25% more text to
# index than without overlap (20 chunks). Too small: no context. Too large:
# the key sentence is diluted and context is wasted. Keep headings and
# document titles as metadata or prefix them to each chunk.
#
# WHERE YOU USE IT
# Tune chunk size on your own questions: measure retrieval recall, not
# intuition.
#
# RUN IT:  python 02_rag-1.py
#

import math

def n_chunks(length, size, overlap):
    stride = size - overlap
    return 1 + math.ceil((length - size) / stride)

print(n_chunks(10000, 500, 100), n_chunks(10000, 500, 0), n_chunks(10000, 1000, 100))
text = list(range(20))
size, overlap = 8, 2
print([text[i:i + size] for i in range(0, len(text) - overlap, size - overlap)])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 25 20 11
# [[0, 1, 2, 3, 4, 5, 6, 7], [6, 7, 8, 9, 10, 11, 12, 13], [12, 13, 14, 15, 16, 17, 18, 19]]
