# -*- coding: utf-8 -*-
# ==========================================================================
# Retrieval-augmented question answering [nlp / Question answering and dialog]
# ==========================================================================
# WHAT IT IS
# Open-domain QA and retrieval-augmented generation (RAG) split the work: a
# retriever (BM25, dense embeddings or both) finds the top-k passages for the
# question; a reader or generator answers using only those passages and
# ideally cites them. This keeps knowledge up to date without retraining, lets
# you restrict answers to approved documents, and makes mistakes traceable: if
# the answer is wrong, was retrieval or reading at fault? Evaluate the two
# stages separately (recall@k of the right passage, then answer correctness
# given the right passage).
#
# WHERE YOU USE IT
# Chunk size, overlap and the number of passages are tuning knobs that matter
# as much as the model.
#
# RUN IT:  python 04_qa-3.py
#

import math
from collections import Counter

docs = ["vilnius is the capital of lithuania", "kaunas is a city in lithuania", "paris is the capital of france"]
q = "capital of lithuania".split()
score = lambda d: sum(1 for w in q if w in d.split())
ranked = sorted(range(len(docs)), key=lambda i: -score(docs[i]))
print([(i, score(docs[i])) for i in ranked])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [(0, 3), (2, 2), (1, 1)]
