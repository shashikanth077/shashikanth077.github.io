# -*- coding: utf-8 -*-
# ==========================================================================
# Stop words, stemming and lemmatization [nlp / Preprocessing and
# tokenization]
# ==========================================================================
# WHAT IT IS
# Stop words (the, of, is) are frequent and often removed for retrieval — but
# they matter for syntax-sensitive tasks ("to be or not to be"). Stemming
# chops suffixes with rules: "running", "runs" → "run" (but also "university"
# and "universe" → "univers"). Lemmatization uses a dictionary and part of
# speech to return the true base form: "better" → "good", "was" → "be".
# Stemming is fast and crude; lemmatization is slower and linguistically
# correct.
#
# WHERE YOU USE IT
# For search, stemming often raises recall at some cost in precision; for
# classification with embeddings, neither is usually needed.
#
# RUN IT:  python 03_prep-2.py
#

def crude_stem(w):
    for suf in ("ing", "ed", "es", "s"):
        if w.endswith(suf) and len(w) - len(suf) >= 3:
            w = w[: -len(suf)]
            break
    if len(w) > 3 and w[-1] == w[-2] and w[-1] not in "aeiou":
        w = w[:-1]
    return w

for w in ("running", "runs", "cats", "studies", "better"):
    print(w, "->", crude_stem(w))
lemma = {"better": "good", "was": "be", "mice": "mouse"}
print(lemma["better"], lemma["mice"])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# running -> run
# runs -> run
# cats -> cat
# studies -> studi
# better -> better
# good mouse
