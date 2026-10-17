# -*- coding: utf-8 -*-
# ==========================================================================
# Train, validation and test sets [maths-ai / Maths inside ML algorithms]
# ==========================================================================
# WHAT IT IS
# Never judge a model on the data it learned from. Split the data: train to
# fit the weights, validation to tune choices (learning rate, model size, when
# to stop), and test — touched once at the end — for an honest final score.
# Cross-validation repeats the split to use small datasets efficiently.
#
# WHERE YOU USE IT
# Leaking test data into training (even through preprocessing) gives falsely
# optimistic results — a common and costly mistake.
#
# RUN IT:  python 06_ml-5.py
#

n = 1000
train, val = int(0.7 * n), int(0.15 * n)
test = n - train - val
print(train, val, test)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 700 150 150
