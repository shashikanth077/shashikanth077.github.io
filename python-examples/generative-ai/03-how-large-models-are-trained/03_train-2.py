# -*- coding: utf-8 -*-
# ==========================================================================
# Training data: quality beats quantity [generative-ai / How large models are
# trained]
# ==========================================================================
# WHAT IT IS
# Web text is the raw material, but raw crawls are noisy. The recipe: filter
# (language, quality classifiers, remove boilerplate and toxic or personal
# data), deduplicate (exact and near-duplicate removal — repeated text is
# memorised and wastes compute), mix sources deliberately (web, books, code,
# maths, multilingual) and decontaminate (remove benchmark questions so
# evaluation is honest). Code and mathematics improve reasoning even for
# non-code tasks. Licensing, consent and privacy of the data are legal and
# ethical questions; document the sources. A smaller, cleaner corpus often
# beats a larger noisy one.
#
# WHERE YOU USE IT
# If the model repeats a rare string from training verbatim, that is
# memorisation: another reason to deduplicate and filter personal data.
#
# RUN IT:  python 03_train-2.py
#

docs = ["the cat sat", "the cat sat", "buy now!!! click here", "A thorough guide to tides", "the cat sat "]
norm = lambda s: " ".join(s.lower().split())
seen, kept = set(), []
for d in docs:
    n = norm(d)
    if n not in seen and "!!!" not in d:
        seen.add(n)
        kept.append(d)
print(len(docs), "->", len(kept), kept)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 5 -> 2 ['the cat sat', 'A thorough guide to tides']
