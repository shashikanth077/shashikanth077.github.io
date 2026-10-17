# -*- coding: utf-8 -*-
# ==========================================================================
# Duplicate keys multiply rows [pandas / Combining tables]
# ==========================================================================
# WHAT IT IS
# If a key value appears twice on each side, a merge pairs every left row with
# every right row: 2 × 2 = 4 rows. This many-to-many explosion silently
# inflates sums and counts. Remove duplicates first or ask pandas to check
# with validate="one_to_one" (or "many_to_one"), which raises a MergeError if
# the assumption is false.
#
# WHERE YOU USE IT
# A join that suddenly makes revenue double is nearly always duplicate keys.
# Compare row counts before and after.
#
# RUN IT:  python 05_combine-4.py
#

import pandas as pd

a = pd.DataFrame({"k": [1, 1], "x": ["a1", "a2"]})
b = pd.DataFrame({"k": [1, 1], "y": ["b1", "b2"]})
print(a.merge(b, on="k").shape)
try:
    a.merge(b, on="k", validate="one_to_one")
except Exception as e:
    print(type(e).__name__)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# (4, 3)
# MergeError
