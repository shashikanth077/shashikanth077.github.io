# -*- coding: utf-8 -*-
# ==========================================================================
# LLM-as-judge and its biases [generative-ai / Evaluating generative systems]
# ==========================================================================
# WHAT IT IS
# For open-ended outputs, a strong model can grade answers against a rubric or
# compare two answers. It is cheap and scalable, but biased: it favours longer
# answers (verbosity bias), the answer listed first (position bias) and text
# that resembles its own style. Mitigations: swap the order and average, give
# a precise rubric with examples, ask for a short justification before the
# score, and — crucially — measure agreement with humans on a sample. If judge
# and human agree on 85% of 100 items while chance agreement is 50%, Cohen's κ
# = (0.85 − 0.5)/(1 − 0.5) = 0.70: substantial but imperfect. Use judges to
# screen, humans to decide.
#
# WHERE YOU USE IT
# Periodically re-check the judge against fresh human labels: models and data
# drift.
#
# RUN IT:  python 03_evalu-2.py
#

observed, chance = 0.85, 0.5
print(round((observed - chance) / (1 - chance), 2))
import numpy as np
a = np.array([1, 1, 0, 1, 0, 0, 1, 1, 0, 1])
b = np.array([1, 0, 0, 1, 0, 1, 1, 1, 0, 1])
print(float((a == b).mean()))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.7
# 0.8
