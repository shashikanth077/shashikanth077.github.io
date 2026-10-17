# -*- coding: utf-8 -*-
# ==========================================================================
# Seeds and reproducibility [numpy / Missing data, randomness and files]
# ==========================================================================
# WHAT IT IS
# A seed starts the generator at a known place, so the same seed gives the
# same sequence every run — essential for debugging and for sharing results.
# Different seeds give different sequences. "42" is just a conventional
# choice. Reproducibility holds for the same code and the same library
# version.
#
# WHERE YOU USE IT
# Papers and teammates need to reproduce your numbers; fix the seed when you
# compare models so differences are real, not luck.
#
# RUN IT:  python 04_data-3.py
#

import numpy as np

a = np.random.default_rng(42).random(3)
b = np.random.default_rng(42).random(3)
c = np.random.default_rng(7).random(3)
print(np.array_equal(a, b))
print(np.array_equal(a, c))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# True
# False
