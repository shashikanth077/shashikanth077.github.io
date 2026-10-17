# -*- coding: utf-8 -*-
# ==========================================================================
# The central limit theorem and standard error [maths-ai / Probability and
# information]
# ==========================================================================
# WHAT IT IS
# Average many independent samples and the averages follow a bell curve around
# the true mean, whatever the original distribution. The spread of those
# averages — the standard error — is σ / √n: it shrinks as the sample grows,
# but only with the square root. Four times the data halves the uncertainty.
#
# WHERE YOU USE IT
# It is why accuracy on a larger test set is a more trustworthy estimate, and
# why confidence intervals narrow with more data.
#
# RUN IT:  python 10_prob-9.py
#

import math
sigma = 2
for n in [1, 4, 25, 100]:
    print(n, sigma / math.sqrt(n))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1 2.0
# 4 1.0
# 25 0.4
# 100 0.2
