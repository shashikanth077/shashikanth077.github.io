# -*- coding: utf-8 -*-
# ==========================================================================
# What comes next: NumPy, Pandas and models [python-ai / Python in real AI
# work]
# ==========================================================================
# WHAT IT IS
# Everything here carries over. A NumPy array is a list made fast, with a
# shape that is a tuple. A Pandas DataFrame is a table of columns, like a list
# of dicts with speed. Model libraries are classes with fit and predict. Next
# in the AI Atlas: NumPy and Pandas, then Maths for AI, then Machine Learning.
#
# WHERE YOU USE IT
# If lists, dicts, functions, classes and files feel natural, the ML libraries
# will read like familiar Python.
#
# RUN IT:  python 06_ai-5.py
#

scores = [72, 45, 88]                  # Python list
passed = [s >= 50 for s in scores]     # comprehension
print(passed)
# NumPy:  np.array(scores) >= 50       -> same result, vectorised
# Pandas: df["score"] >= 50            -> a whole column at once

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [True, False, True]
