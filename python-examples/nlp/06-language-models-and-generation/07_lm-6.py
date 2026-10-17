# -*- coding: utf-8 -*-
# ==========================================================================
# Evaluating language models and generated text [nlp / Language models and
# generation]
# ==========================================================================
# WHAT IT IS
# Intrinsic: perplexity on held-out text. Extrinsic: does the model help the
# real task (speech word-error rate, translation quality, answer accuracy)?
# For generated text: overlap metrics such as BLEU and ROUGE, embedding-based
# scores, task-specific checks (does the code run?), and human or model-based
# judgement. ROUGE-1 compares unigrams with a reference: candidate "the cat
# sat on the mat", reference "the cat is on the mat" → 5 words overlap,
# precision 5/6, recall 5/6. Overlap metrics reward copying and miss
# paraphrases, so they need human sanity checks.
#
# WHERE YOU USE IT
# Report several metrics plus examples; one number never tells whether text is
# truthful, safe or useful.
#
# RUN IT:  python 07_lm-6.py
#

from collections import Counter

ref = "the cat is on the mat".split()
cand = "the cat sat on the mat".split()
overlap = sum((Counter(ref) & Counter(cand)).values())
p, r = overlap / len(cand), overlap / len(ref)
print(overlap, round(p, 3), round(r, 3), round(2 * p * r / (p + r), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 5 0.833 0.833 0.833
