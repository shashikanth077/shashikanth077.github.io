# -*- coding: utf-8 -*-
# ==========================================================================
# Benchmarks, contamination and honest reporting [generative-ai / Evaluating
# generative systems]
# ==========================================================================
# WHAT IT IS
# Benchmark questions that appeared in training data inflate scores
# (contamination): a model memorises rather than solves. Defences: deduplicate
# and decontaminate training data against test sets, use fresh or private test
# sets, check whether a model reproduces the exact wording of questions, and
# prefer tasks that regenerate (new numbers each time). When you report
# results, give the model version, prompt, number of shots, sampling settings,
# the metric definition and the number of test cases with a confidence
# interval. A 2-point gap on a 100-question test (standard error ≈ 4 points)
# is noise.
#
# WHERE YOU USE IT
# Rerun evaluations on every model update: behaviour changes even when the
# name does not.
#
# RUN IT:  python 05_evalu-4.py
#

import numpy as np

n, p = 100, 0.8
se = np.sqrt(p * (1 - p) / n)
print(round(float(se), 3), round(float(1.96 * se), 3))
print(round(float(1.96 * np.sqrt(p * (1 - p) / 2000)), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.04 0.078
# 0.018
