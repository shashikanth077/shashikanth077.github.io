# -*- coding: utf-8 -*-
# ==========================================================================
# Evaluating RAG: retrieval and generation [generative-ai /
# Retrieval-augmented generation]
# ==========================================================================
# WHAT IT IS
# Measure the two halves separately. Retrieval: for a set of questions with
# known relevant chunks, compute recall@k (is the right chunk in the top k?)
# and MRR (1/rank of the first right chunk). Generation: faithfulness (is
# every claim supported by the retrieved text?), answer relevance (does it
# answer the question?) and correctness against a reference. Example: 20
# questions, the right chunk is in the top 5 for 17 → recall@5 = 0.85; if
# correct answers needed it and 15 of those 17 were answered correctly, the
# generation step succeeded on 88% of the cases where retrieval worked. Fix
# the weaker half first.
#
# WHERE YOU USE IT
# Include unanswerable questions in the test set: the right behaviour is to
# say it is not in the sources.
#
# RUN IT:  python 06_rag-5.py
#

hits, total, answered = 17, 20, 15
print(hits / total, round(answered / hits, 3), round(answered / total, 3))
ranks = [1, 2, 1, 4, 1, None, 3]
mrr = sum(1 / r for r in ranks if r) / len(ranks)
print(round(mrr, 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.85 0.882 0.75
# 0.583
