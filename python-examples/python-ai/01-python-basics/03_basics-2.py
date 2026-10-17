# -*- coding: utf-8 -*-
# ==========================================================================
# Conditions and loops [python-ai / Python basics]
# ==========================================================================
# WHAT IT IS
# if / elif / else choose a branch. for repeats a block for every item of a
# sequence, while repeats until a condition fails, and range(n) counts from 0
# to n-1. The indentation is the block — there are no braces.
#
# WHERE YOU USE IT
# Training is just loops: for each epoch, for each batch — compute, update,
# repeat. Filtering rows or labelling by a threshold is an if.
#
# RUN IT:  python 03_basics-2.py
#

scores = [72, 45, 88]
passed = 0
for s in scores:
    if s >= 50:
        passed += 1
print(passed)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 2
