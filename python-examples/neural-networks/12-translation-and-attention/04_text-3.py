# -*- coding: utf-8 -*-
# ==========================================================================
# BLEU: scoring translations [neural-networks / Translation and attention]
# ==========================================================================
# WHAT IT IS
# BLEU compares the n-gram overlap between a machine translation and reference
# translations and applies a brevity penalty for outputs that are too short.
# Simplified unigram precision: candidate with 7 tokens, 5 of them matching →
# 5/7 = 0.714. Brevity penalty = 1 if the candidate is at least as long as the
# reference, else exp(1 − r/c). Real BLEU uses several n-gram orders (usually
# up to 4), clipped counts and corpus-level aggregation, and should be read
# alongside human inspection of examples.
#
# WHERE YOU USE IT
# A high BLEU is not the same as a good translation, and scores are comparable
# only under the same tokenisation.
#
# RUN IT:  python 04_text-3.py
#

import math

cand, match, ref = 6, 5, 8
precision = match / cand
bp = 1.0 if cand >= ref else math.exp(1 - ref / cand)
print(round(precision, 4), round(bp, 4), round(bp * precision, 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.8333 0.7165 0.5971
