# -*- coding: utf-8 -*-
# ==========================================================================
# Combining conditions with & | ~ [numpy / Indexing and slicing]
# ==========================================================================
# WHAT IT IS
# To combine masks use & (and), | (or) and ~ (not) — each condition in
# parentheses. Python's and / or fail on arrays because they need a single
# True or False. (marks >= 50) & (marks <= 90) is the mark range 50–90.
#
# WHERE YOU USE IT
# Selecting "age between 18 and 65 and country == X" from a feature matrix is
# exactly this.
#
# RUN IT:  python 07_index-6.py
#

import numpy as np

marks = np.array([35, 48, 50, 67, 91])
inside = (marks >= 50) & (marks <= 90)
print(inside)
print(marks[inside])
print(marks[(marks < 40) | (marks > 90)])
print(marks[~inside])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [False False  True  True False]
# [50 67]
# [35 91]
# [35 48 91]
