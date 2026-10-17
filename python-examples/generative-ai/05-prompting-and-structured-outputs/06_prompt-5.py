# -*- coding: utf-8 -*-
# ==========================================================================
# Temperature and sampling settings by task [generative-ai / Prompting and
# structured outputs]
# ==========================================================================
# WHAT IT IS
# Sampling settings trade determinism for variety. Temperature T rescales the
# logits (softmax of z/T); top-p keeps the smallest set of tokens whose
# probabilities add to p. For extraction, classification, code and maths use
# low temperature (0–0.3); for brainstorming and creative writing use 0.7–1.0.
# Low temperature is not a guarantee of identical outputs (hardware and
# batching can still change results) and does not make answers more correct —
# it makes them more repeatable. Tune one setting at a time and evaluate on
# your test cases.
#
# WHERE YOU USE IT
# For evaluation always fix the settings; otherwise a score change may just be
# sampling noise.
#
# RUN IT:  python 06_prompt-5.py
#

import numpy as np

z = np.array([3.0, 2.0, 1.0, 0.0])
for T in (0.2, 1.0, 1.5):
    p = np.exp(z / T) / np.exp(z / T).sum()
    print(T, p.round(3).tolist(), round(float(-(p * np.log(p)).sum()), 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.2 [0.993, 0.007, 0.0, 0.0] 0.04
# 1.0 [0.644, 0.237, 0.087, 0.032] 0.95
# 1.5 [0.523, 0.268, 0.138, 0.071] 1.15
