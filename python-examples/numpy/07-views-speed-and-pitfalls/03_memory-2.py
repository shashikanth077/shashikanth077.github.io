# -*- coding: utf-8 -*-
# ==========================================================================
# Common mistakes and how to avoid them [numpy / Views, speed and pitfalls]
# ==========================================================================
# WHAT IT IS
# The usual suspects: shape mismatches (print .shape first), using and/or
# instead of &/|, forgetting that slices are views, mixing up and @, and
# letting NaNs spread. A calm habit solves most of them: inspect shape, dtype
# and a few values before and after every step.
#
# WHERE YOU USE IT
# Debugging array code is mostly checking shapes; senior engineers print them
# constantly.
#
# RUN IT:  python 03_memory-2.py
#

import numpy as np

a = np.array([20, 50, 80])
try:
    a[(a > 25) and (a < 60)]
except ValueError:
    print("ValueError: use & instead of 'and'")
print(a[(a > 25) & (a < 60)])
print(np.mean([1, np.nan, 3]))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ValueError: use & instead of 'and'
# [50]
# nan
