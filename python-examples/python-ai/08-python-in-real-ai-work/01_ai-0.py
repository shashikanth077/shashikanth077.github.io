# -*- coding: utf-8 -*-
# ==========================================================================
# Predictions versus labels: accuracy with zip [python-ai / Python in real AI
# work]
# ==========================================================================
# WHAT IT IS
# zip(a, b) pairs the items of two lists. Comparing predictions with the true
# labels pair by pair and counting the matches gives accuracy: correct ÷
# total. In Python, True counts as 1 and False as 0 when you sum them.
#
# WHERE YOU USE IT
# Accuracy is the first metric you compute for any classifier — and you can
# compute it with nothing but two lists, zip and sum.
#
# RUN IT:  python 01_ai-0.py
#

predictions = [1, 0, 1, 1]
actual      = [1, 0, 0, 1]
correct = sum(p == a for p, a in zip(predictions, actual))
accuracy = correct / len(actual)
print(correct, accuracy)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 3 0.75
