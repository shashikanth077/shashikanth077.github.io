# -*- coding: utf-8 -*-
# ==========================================================================
# Returning several values [python-ai / Functions]
# ==========================================================================
# WHAT IT IS
# A function can return several values separated by commas. Python packs them
# into a tuple, and you unpack it on the other side. Document the order,
# because callers rely on position.
#
# WHERE YOU USE IT
# X_train, X_test, y_train, y_test = train_test_split(...) is exactly this:
# four returned values unpacked at once.
#
# RUN IT:  python 04_funcs-3.py
#

def summary(scores):
    return min(scores), max(scores), sum(scores) / len(scores)

low, high, average = summary([70, 80, 90])
print(low, high, average)
print(summary([70, 80, 90]))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 70 90 80.0
# (70, 90, 80.0)
