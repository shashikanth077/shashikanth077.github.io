# -*- coding: utf-8 -*-
# ==========================================================================
# Population, sample and inference [machine-learning / Statistics you need]
# ==========================================================================
# WHAT IT IS
# We usually cannot measure everything. The population is every case we care
# about (all future tickets); a sample is the part we actually observe (100
# tickets). Descriptive statistics summarise the sample. Inferential
# statistics use probability to say what the sample suggests about the
# population — and how sure we can be. A random, representative sample is what
# makes this valid.
#
# WHERE YOU USE IT
# A biased sample (only angry customers write reviews) gives biased
# conclusions no matter how large it is.
#
# RUN IT:  python 04_stats-4.py
#

import numpy as np

rng = np.random.default_rng(1)
population = np.arange(1, 101)
sample = rng.choice(population, size=10, replace=False)
print(population.mean(), len(sample))
print(abs(sample.mean() - population.mean()) < 25)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 50.5 10
# True
