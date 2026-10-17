# -*- coding: utf-8 -*-
# ==========================================================================
# Hypothesis tests and p-values [maths-ai / Probability and information]
# ==========================================================================
# WHAT IT IS
# A hypothesis test asks: if nothing special were going on (the null
# hypothesis), how surprising is my result? The p-value is that probability of
# seeing something at least this extreme. A small p-value (below a chosen
# level such as 0.05) is evidence against the null — it is not the probability
# that the null is true. Pick the test by the data: z or t for means,
# chi-square for counts, ANOVA for several means.
#
# WHERE YOU USE IT
# A/B tests of two models, checking whether an accuracy gain is real or luck,
# and feature selection all use these tests.
#
# RUN IT:  python 11_prob-10.py
#

import math
mean, mu, sigma, n = 52, 50, 10, 25
z = (mean - mu) / (sigma / math.sqrt(n))
p = 2 * (1 - 0.5 * (1 + math.erf(abs(z) / math.sqrt(2))))
print(z, round(p, 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1.0 0.3173
