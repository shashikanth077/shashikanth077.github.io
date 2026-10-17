# -*- coding: utf-8 -*-
# ==========================================================================
# Entropy: measuring uncertainty [maths-ai / Probability and information]
# ==========================================================================
# WHAT IT IS
# Entropy measures how unpredictable an outcome is: H = −Σ p log₂ p (in bits).
# A fair coin (50/50) is maximally uncertain, 1 bit. A coin that is almost
# always heads has little entropy: you barely learn anything from seeing it.
# Certainty has entropy 0.
#
# WHERE YOU USE IT
# Decision trees split on the question that removes the most entropy; entropy
# also underlies cross-entropy and KL divergence.
#
# RUN IT:  python 07_prob-6.py
#

import math

def entropy(p):
    return -sum(q * math.log2(q) for q in p if q > 0)

print(entropy([0.5, 0.5]), round(entropy([0.9, 0.1]), 3))
print(max(0.0, entropy([1.0, 0.0])))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1.0 0.469
# 0.0
