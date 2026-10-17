# -*- coding: utf-8 -*-
# ==========================================================================
# Fractions, ratios and percentages [maths-ai / Numbers, algebra and notation]
# ==========================================================================
# WHAT IT IS
# A fraction is a division: 45/60 = 0.75. A ratio compares two amounts, and a
# percentage is a fraction out of 100 (0.75 = 75%). Accuracy, error rates and
# probabilities are all just fractions of a total.
#
# WHERE YOU USE IT
# Accuracy = correct ÷ total. Precision, recall, dropout rates and train/test
# splits are all percentages of something.
#
# RUN IT:  python 02_num-1.py
#

correct, total = 45, 60
print(correct / total)
print(f"{correct / total:.1%}")
print(f"{(total - correct) / total:.1%} wrong")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.75
# 75.0%
# 25.0% wrong
