# -*- coding: utf-8 -*-
# ==========================================================================
# Building the prompt: context budget and citations [generative-ai /
# Retrieval-augmented generation]
# ==========================================================================
# WHAT IT IS
# Retrieved chunks are placed in the prompt with identifiers so the answer can
# cite them: "[1] … [2] …". Instruct the model to answer only from the
# sources, to say "not found" when they do not contain the answer, and to
# quote or cite. Budget the window: with 8,000 tokens, 500 system, 100
# question and 1,000 reserved for the answer, 6,400 tokens remain — 12 chunks
# of 500. More chunks raise recall but add noise and cost; put the best ones
# first and last (models use the middle less well). Deduplicate overlapping
# chunks and drop low-similarity ones with a threshold rather than always
# filling the window.
#
# WHERE YOU USE IT
# Check citations automatically: every cited source id must exist and the
# quoted text must appear in it.
#
# RUN IT:  python 05_rag-4.py
#

window, fixed = 8000, 500 + 100 + 1000
room = window - fixed
print(room, room // 500)
chunks = [("doc1", 0.82), ("doc2", 0.64), ("doc3", 0.31)]
kept = [c for c in chunks if c[1] >= 0.5]
print(kept)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 6400 12
# [('doc1', 0.82), ('doc2', 0.64)]
