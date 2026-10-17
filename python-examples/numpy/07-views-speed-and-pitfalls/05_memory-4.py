# -*- coding: utf-8 -*-
# ==========================================================================
# Comparing floats: isclose and allclose [numpy / Views, speed and pitfalls]
# ==========================================================================
# WHAT IT IS
# Decimals are stored approximately, so 0.1 + 0.2 == 0.3 is False. Compare
# with a tolerance: np.isclose(a, b) per element, np.allclose(a, b) for a
# whole array. Use np.array_equal only for exact integer or boolean arrays.
#
# WHERE YOU USE IT
# Unit tests for numeric code, and checking that two implementations of a
# model agree, use np.allclose.
#
# RUN IT:  python 05_memory-4.py
#

import numpy as np

print(0.1 + 0.2 == 0.3)
print(np.isclose(0.1 + 0.2, 0.3))
a = np.array([0.1 + 0.2, 1.0])
b = np.array([0.3, 1.0])
print(a == b)
print(np.allclose(a, b))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# False
# True
# [False  True]
# True
