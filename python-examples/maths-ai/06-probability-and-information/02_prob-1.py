# -*- coding: utf-8 -*-
# ==========================================================================
# Conditional probability and independence [maths-ai / Probability and
# information]
# ==========================================================================
# WHAT IT IS
# Conditional probability narrows the world: P(A | B) = P(A and B) / P(B) is
# "the chance of A once we know B happened". Events are independent when
# knowing one tells you nothing about the other, so P(A | B) = P(A).
#
# WHERE YOU USE IT
# Every classifier estimates a conditional probability: P(class | features).
# Naive Bayes assumes the features are independent given the class.
#
# RUN IT:  python 02_prob-1.py
#

total, billing, urgent_total, urgent_billing = 100, 40, 20, 10
print(urgent_total / total)
print(urgent_billing / billing)
print(urgent_billing / total)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.2
# 0.25
# 0.1
