# -*- coding: utf-8 -*-
# ==========================================================================
# Exponentials and the number e [maths-ai / Numbers, algebra and notation]
# ==========================================================================
# WHAT IT IS
# An exponential multiplies by the same factor again and again: it starts
# slowly and then explodes. The special number e ≈ 2.718 makes eˣ always
# positive and its slope equal to its own height. It appears in sigmoid,
# softmax and compound growth.
#
# WHERE YOU USE IT
# eˣ turns any score — positive or negative — into a positive number, which is
# exactly what softmax and sigmoid need.
#
# RUN IT:  python 05_num-4.py
#

import math
print(math.e)
print(math.exp(0), math.exp(1))
print(round(math.exp(-1), 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 2.718281828459045
# 1.0 2.718281828459045
# 0.3679
