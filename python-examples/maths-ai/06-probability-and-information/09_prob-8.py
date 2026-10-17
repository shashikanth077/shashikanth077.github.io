# -*- coding: utf-8 -*-
# ==========================================================================
# KL divergence: how different are two distributions? [maths-ai / Probability
# and information]
# ==========================================================================
# WHAT IT IS
# KL divergence measures how far a distribution Q is from the true
# distribution P: D(P‖Q) = Σ p ln(p/q). It is 0 only when Q equals P, never
# negative, and not symmetric. Cross-entropy equals entropy plus KL, which is
# why minimising cross-entropy pulls the model's distribution toward the
# data's.
#
# WHERE YOU USE IT
# KL appears in variational autoencoders, knowledge distillation and RLHF
# regularisation.
#
# RUN IT:  python 09_prob-8.py
#

import math
P = [0.5, 0.3, 0.2]
Q = [0.4, 0.4, 0.2]
kl = sum(p * math.log(p / q) for p, q in zip(P, Q))
print(round(kl, 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.0253
