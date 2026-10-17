# -*- coding: utf-8 -*-
# ==========================================================================
# Counting categories: value_counts [pandas / Creating and transforming
# columns]
# ==========================================================================
# WHAT IT IS
# s.value_counts() counts how often each value appears, sorted from most to
# least; normalize=True gives shares instead. It is the quickest way to see
# the balance of a label column — and to spot typos, since "Pune" and "pune"
# show up as two rows. Drag the HR count to watch the shares change.
#
# WHERE YOU USE IT
# Class balance decides your model choice and metric: if 95% of rows are one
# class, accuracy alone is meaningless.
#
# RUN IT:  python 04_transform-3.py
#

import pandas as pd

dept = pd.Series(["IT", "Sales", "IT", "HR", "Sales", "IT"])
print(dept.value_counts())
print(dept.value_counts(normalize=True).round(2).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# IT       3
# Sales    2
# HR       1
# Name: count, dtype: int64
# [0.5, 0.33, 0.17]
