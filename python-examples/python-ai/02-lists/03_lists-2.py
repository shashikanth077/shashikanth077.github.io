# -*- coding: utf-8 -*-
# ==========================================================================
# Slicing [python-ai / Lists]
# ==========================================================================
# WHAT IT IS
# items[start:stop:step] returns a new list. Start is included, stop is
# excluded; leave either blank for "from the beginning" or "to the end". A
# step of -1 reverses the order. Slicing never raises IndexError for
# out-of-range bounds.
#
# WHERE YOU USE IT
# Train/test splits are slices — data[:80] and data[80:] — and windowing a
# time series is slicing too.
#
# RUN IT:  python 03_lists-2.py
#

scores = [10, 20, 30, 40, 50, 60]
print(scores[1:4])
print(scores[:3])
print(scores[-2:])
print(scores[::2])
print(scores[::-1])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [20, 30, 40]
# [10, 20, 30]
# [50, 60]
# [10, 30, 50]
# [60, 50, 40, 30, 20, 10]
