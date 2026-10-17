# -*- coding: utf-8 -*-
# ==========================================================================
# Tuples: fixed, ordered records [python-ai / Tuples]
# ==========================================================================
# WHAT IT IS
# A tuple is an ordered, immutable sequence. You can read and slice it, but
# you can't reassign, add or remove items. Commas make the tuple; parentheses
# just help readability. Use one for a small fixed record such as a coordinate
# or an image shape.
#
# WHERE YOU USE IT
# Array and image shapes like (224, 224, 3) are tuples. They are fixed facts
# about the data, so immutability is a feature.
#
# RUN IT:  python 01_tuples-0.py
#

location = (54.6872, 25.2797)
print(location[0])
# location[0] = 55.0   -> TypeError
updated = (55.0, location[1])
print(updated)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 54.6872
# (55.0, 25.2797)
