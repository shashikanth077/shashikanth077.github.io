# -*- coding: utf-8 -*-
# ==========================================================================
# Functions as reusable metrics [python-ai / Python in real AI work]
# ==========================================================================
# WHAT IT IS
# A metric is a plain function: predictions and labels in, a number out — no
# printing and no hidden globals. Validate that the lengths match, handle
# empty input, and return the value so you can log, compare and plot it.
#
# WHERE YOU USE IT
# Mean absolute error, accuracy and precision are the same few lines reused
# across every experiment.
#
# RUN IT:  python 04_ai-3.py
#

def mean_absolute_error(actual, predicted):
    if len(actual) != len(predicted) or not actual:
        raise ValueError("need equal, non-empty lists")
    errors = [abs(a - p) for a, p in zip(actual, predicted)]
    return sum(errors) / len(errors)

print(mean_absolute_error([10, 20], [12, 18]))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 2.0
