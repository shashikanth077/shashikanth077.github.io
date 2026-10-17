# -*- coding: utf-8 -*-
# ==========================================================================
# Bernoulli and binomial distributions [maths-ai / Probability and
# information]
# ==========================================================================
# WHAT IT IS
# A Bernoulli trial has two outcomes (success with probability p). Repeat it n
# times independently and count successes: that is the binomial distribution,
# P(k) = C(n, k) pᵏ (1 − p)ⁿ⁻ᵏ, with mean n·p. A classifier's right/wrong
# answers on n test examples are binomial.
#
# WHERE YOU USE IT
# Coin-flip logic underlies accuracy estimates, A/B tests and the labels a
# logistic model predicts.
#
# RUN IT:  python 05_prob-4.py
#

import math
n, p = 10, 0.3
pmf = [math.comb(n, k) * p**k * (1 - p) ** (n - k) for k in range(n + 1)]
print(round(pmf[3], 4), round(sum(pmf), 4))
print(n * p)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.2668 1.0
# 3.0
