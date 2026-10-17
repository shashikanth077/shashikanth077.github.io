# -*- coding: utf-8 -*-
# ==========================================================================
# Bayes' theorem and the base rate [maths-ai / Probability and information]
# ==========================================================================
# WHAT IT IS
# Bayes' theorem reverses a conditional probability: P(A | B) = P(B | A) ·
# P(A) / P(B). It shows why a positive result from a good test can still be
# probably wrong when the thing is rare: the base rate (prior) matters as much
# as the test's accuracy.
#
# WHERE YOU USE IT
# Medical screening, spam filters and Naive Bayes all use it. Ignoring base
# rates is the classic mistake in reading model alerts.
#
# RUN IT:  python 03_prob-2.py
#

prev, sens, fpr = 0.01, 0.9, 0.05
p_pos = sens * prev + fpr * (1 - prev)
posterior = sens * prev / p_pos
print(round(p_pos, 4), round(posterior, 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.0585 0.154
