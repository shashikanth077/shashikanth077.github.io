# -*- coding: utf-8 -*-
# ==========================================================================
# Softmax: scores to probabilities [maths-ai / Activations and outputs]
# ==========================================================================
# WHAT IT IS
# Softmax turns a vector of raw class scores into probabilities that add to 1:
# take eˢᶜᵒʳᵉ of each, then divide by the total. The biggest score gets the
# biggest share, and exponentials exaggerate gaps. It is applied in the last
# layer of a multi-class classifier.
#
# WHERE YOU USE IT
# A language model's next-word prediction is a softmax over its whole
# vocabulary.
#
# RUN IT:  python 04_act-3.py
#

import math
scores = [2.0, 1.0, 0.1]
exps = [math.exp(s) for s in scores]
probs = [e / sum(exps) for e in exps]
print([round(p, 3) for p in probs], round(sum(probs), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0.659, 0.242, 0.099] 1.0
