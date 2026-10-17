# -*- coding: utf-8 -*-
# ==========================================================================
# The normal distribution and the empirical rule [maths-ai / Describing data]
# ==========================================================================
# WHAT IT IS
# Many natural quantities pile up in a bell shape: the normal (Gaussian)
# distribution. The mean sets the centre, the standard deviation the width.
# The empirical rule: about 68% of values fall within 1σ of the mean, 95%
# within 2σ and 99.7% within 3σ. The total area under the curve is 1.
#
# WHERE YOU USE IT
# Weights are initialised from a normal distribution, noise is modelled as
# Gaussian, and z-scores flag outliers beyond about 3σ.
#
# RUN IT:  python 05_stats-4.py
#

import math

def within(k):
    return math.erf(k / math.sqrt(2))

print(round(within(1), 4), round(within(2), 4), round(within(3), 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.6827 0.9545 0.9973
