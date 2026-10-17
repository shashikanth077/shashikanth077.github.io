# -*- coding: utf-8 -*-
# ==========================================================================
# Cleaning text with .str [pandas / Cleaning messy data]
# ==========================================================================
# WHAT IT IS
# The .str accessor applies a text operation to every value: strip() removes
# stray spaces, lower() unifies case, replace(pattern, new, regex=True) fixes
# patterns, contains searches and split breaks text apart. Standardise text
# first, otherwise "Pune ", "pune" and "PUNE" are counted as three different
# cities.
#
# WHERE YOU USE IT
# Category columns typed by humans are messy. Normalising them is what makes
# groupby and value_counts trustworthy.
#
# RUN IT:  python 05_clean-4.py
#

import pandas as pd

s = pd.Series(["  Pune ", "DELHI", "pune", "New  Delhi"])
clean = s.str.strip().str.lower().str.replace(r"\s+", " ", regex=True)
print(clean.tolist())
print(clean.str.contains("delhi").tolist())
print(clean.str.split(" ").str[0].tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ['pune', 'delhi', 'pune', 'new delhi']
# [False, True, False, True]
# ['pune', 'delhi', 'pune', 'new']
