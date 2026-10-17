# -*- coding: utf-8 -*-
# ==========================================================================
# Indexing starts at zero [python-ai / Python basics]
# ==========================================================================
# WHAT IT IS
# Positions in lists, tuples and strings start at 0. Negative indexes count
# from the end: -1 is the last item. Asking for a position that doesn't exist
# raises IndexError.
#
# WHERE YOU USE IT
# Rows, columns, pixels and token positions are all index-based. An off-by-one
# mistake silently shifts your features or labels by one.
#
# RUN IT:  python 02_basics-1.py
#

letters = ["A", "B", "C"]
print(letters[0])
print(letters[-1])
print(letters[3])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# A
# C
# IndexError: list index out of range
