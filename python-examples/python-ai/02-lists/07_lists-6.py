# -*- coding: utf-8 -*-
# ==========================================================================
# Sorting and in-place methods [python-ai / Lists]
# ==========================================================================
# WHAT IT IS
# list.sort() sorts the list in place and returns None; sorted(items) returns
# a new sorted list and leaves the original alone. Both accept key= and
# reverse=True. The "returns None" rule also holds for append, extend and
# reverse.
#
# WHERE YOU USE IT
# Ranking predictions by confidence is sorted(..., key=..., reverse=True).
# Writing x = x.sort() wipes your data with None.
#
# RUN IT:  python 07_lists-6.py
#

scores = [30, 10, 20]
ranked = sorted(scores, reverse=True)
result = scores.sort()
print(ranked)
print(result)
print(scores)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [30, 20, 10]
# None
# [10, 20, 30]
