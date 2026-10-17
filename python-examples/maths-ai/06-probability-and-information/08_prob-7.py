# -*- coding: utf-8 -*-
# ==========================================================================
# Cross-entropy and the log loss [maths-ai / Probability and information]
# ==========================================================================
# WHAT IT IS
# Cross-entropy measures how surprised a model is by the truth: for the
# correct class with predicted probability p, the loss is −ln(p). Confident
# and right: close to 0. Confident and wrong: huge. It is the standard loss
# for classification because it rewards honest probabilities.
#
# WHERE YOU USE IT
# Every classifier from logistic regression to GPT-style language models is
# trained by minimising cross-entropy.
#
# RUN IT:  python 08_prob-7.py
#

import math
for p in [0.9, 0.5, 0.05]:
    print(p, round(-math.log(p), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.9 0.105
# 0.5 0.693
# 0.05 2.996
