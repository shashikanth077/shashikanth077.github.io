# -*- coding: utf-8 -*-
# ==========================================================================
# Logarithms [maths-ai / Numbers, algebra and notation]
# ==========================================================================
# WHAT IT IS
# A logarithm answers "what power gives this number?": since e² ≈ 7.39,
# ln(7.39) ≈ 2. It undoes the exponential, is only defined for positive
# numbers, dives to −∞ near 0 and grows slowly. Logs turn products into sums:
# ln(ab) = ln a + ln b.
#
# WHERE YOU USE IT
# Cross-entropy loss is −ln(p); log-likelihoods add instead of multiply; and
# log scales tame huge ranges of values.
#
# RUN IT:  python 06_num-5.py
#

import math
print(math.log(math.e), math.log(1))
print(math.log2(8), math.log10(1000))
print(round(math.exp(math.log(5)), 6))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1.0 0.0
# 3.0 3.0
# 5.0
