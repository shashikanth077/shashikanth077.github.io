# -*- coding: utf-8 -*-
# ==========================================================================
# Pretraining: predict the next token [generative-ai / How large models are
# trained]
# ==========================================================================
# WHAT IT IS
# Pretraining minimises the cross-entropy of the next token over a huge text
# corpus: loss = −ln P(true next token | previous tokens), averaged over every
# position. If the model gives the true word probability 0.25 the loss is
# 1.386; probability 0.5 → 0.693. A loss of 2.0 corresponds to a perplexity of
# e² = 7.4 (as unsure as a choice between 7 words), a loss of 3.0 to 20.1. No
# labels are needed — the text labels itself — which is why training can use
# the whole web. The skills of an LLM (grammar, facts, reasoning patterns,
# code) are by-products of getting better at this one prediction.
#
# WHERE YOU USE IT
# Pretraining loss predicts general ability well, but not every downstream
# skill: always evaluate on the tasks you care about.
#
# RUN IT:  python 01_train-0.py
#

import numpy as np

for p in (0.25, 0.5, 0.9):
    print(p, round(float(-np.log(p)), 3))
for loss in (2.0, 3.0):
    print(loss, round(float(np.exp(loss)), 1))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.25 1.386
# 0.5 0.693
# 0.9 0.105
# 2.0 7.4
# 3.0 20.1
