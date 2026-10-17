# -*- coding: utf-8 -*-
# ==========================================================================
# Broadcasting rules: compare shapes from the right [numpy / Maths,
# broadcasting and axes]
# ==========================================================================
# WHAT IT IS
# The rule: line the shapes up from the RIGHT. Each pair of sizes must be
# equal, or one of them must be 1 (a missing leading size counts as 1). Sizes
# of 1 stretch. So (2,3) + (3,) works, (3,1) + (1,4) gives (3,4), but (2,3) +
# (2,) fails because 3 ≠ 2.
#
# WHERE YOU USE IT
# A shape-mismatch ValueError is the most common NumPy error; this rule tells
# you exactly why and how to fix it with reshape or [:, None].
#
# RUN IT:  python 05_math-4.py
#

import numpy as np

a = np.ones((2, 3))
print((a + np.ones(3)).shape)
print((a + np.ones((2, 1))).shape)
print((np.ones((3, 1)) + np.ones((1, 4))).shape)
try:
    a + np.ones(2)
except ValueError:
    print("(2, 3) + (2,) -> ValueError")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# (2, 3)
# (2, 3)
# (3, 4)
# (2, 3) + (2,) -> ValueError
