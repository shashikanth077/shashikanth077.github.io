# -*- coding: utf-8 -*-
# ==========================================================================
# Common distributions at a glance [maths-ai / Probability and information]
# ==========================================================================
# WHAT IT IS
# Different situations have familiar shapes. Normal: measurement noise.
# Bernoulli/binomial: yes-no counts. Poisson: how many events fall in an
# interval. Exponential: the waiting time between events. Uniform: every value
# equally likely. Choosing the right one is half of modelling.
#
# WHERE YOU USE IT
# Loss functions correspond to assumptions: squared error assumes Gaussian
# noise, cross-entropy assumes Bernoulli/categorical labels.
#
# RUN IT:  python 06_prob-5.py
#

import math
lam = 3                       # average events per interval
k = 2
p = math.exp(-lam) * lam**k / math.factorial(k)
print(round(p, 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.224
