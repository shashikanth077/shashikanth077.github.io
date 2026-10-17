# -*- coding: utf-8 -*-
# ==========================================================================
# Machine translation and its evaluation [nlp / Sequence-to-sequence and
# transformers]
# ==========================================================================
# WHAT IT IS
# Neural machine translation encodes the source and decodes the target with
# attention; modern systems use transformers trained on millions of sentence
# pairs, with sub-word tokens. Quality is estimated with BLEU (n-gram
# precision against reference translations times a brevity penalty), newer
# learned metrics, and human ratings of adequacy (meaning preserved) and
# fluency. Hard cases: idioms, gender and formality, rare languages with
# little data, and domain terminology — which is why in-domain fine-tuning and
# glossaries matter.
#
# WHERE YOU USE IT
# Always look at examples: a high BLEU can hide a systematically wrong named
# entity or number.
#
# RUN IT:  python 04_s2s-3.py
#

import math
from collections import Counter

cand = "the cat sat on the mat".split()
ref = "the cat is on the mat".split()
clipped = sum((Counter(cand) & Counter(ref)).values())
precision = clipped / len(cand)
bp = 1.0 if len(cand) >= len(ref) else math.exp(1 - len(ref) / len(cand))
print(clipped, round(precision, 3), bp, round(bp * precision, 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 5 0.833 1.0 0.833
