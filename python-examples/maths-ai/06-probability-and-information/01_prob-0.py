# -*- coding: utf-8 -*-
# ==========================================================================
# Probability, events and complements [maths-ai / Probability and information]
# ==========================================================================
# WHAT IT IS
# Probability is a number from 0 (impossible) to 1 (certain). The
# probabilities of all possible outcomes add up to 1, so the complement is
# P(not A) = 1 − P(A). For overlapping events, add and subtract the overlap:
# P(A or B) = P(A) + P(B) − P(A and B).
#
# WHERE YOU USE IT
# A classifier's output is a probability for each class, and the complement
# rule is how a binary model gets both from one number.
#
# RUN IT:  python 01_prob-0.py
#

p_spam = 0.3
print(round(1 - p_spam, 2))
p_a, p_b, p_both = 0.5, 0.4, 0.2
print(round(p_a + p_b - p_both, 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.7
# 0.7
