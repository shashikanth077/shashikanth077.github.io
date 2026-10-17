# -*- coding: utf-8 -*-
# ==========================================================================
# What machine learning is [machine-learning / The big picture]
# ==========================================================================
# WHAT IT IS
# In ordinary programming you write the rules and the computer applies them to
# data to produce answers. In machine learning you give the computer data AND
# the correct answers, and it finds the rules itself. The rule it learns — a
# threshold, a set of weights, a tree — is called the model. Below, a "model"
# is just a threshold found from eight labelled emails.
#
# WHERE YOU USE IT
# Use ML when the rule is too complicated to write by hand (spam, fraud, image
# content) but you have many examples with known answers.
#
# RUN IT:  python 01_big-0.py
#

import numpy as np

links = np.array([0, 1, 1, 2, 3, 4, 4, 5])
is_spam = np.array([0, 0, 0, 0, 1, 1, 1, 1])
print(links[is_spam == 0].max(), links[is_spam == 1].min())
threshold = (links[is_spam == 0].max() + links[is_spam == 1].min()) / 2
print(threshold)
print((links > threshold).astype(int).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 2 3
# 2.5
# [0, 0, 0, 0, 1, 1, 1, 1]
