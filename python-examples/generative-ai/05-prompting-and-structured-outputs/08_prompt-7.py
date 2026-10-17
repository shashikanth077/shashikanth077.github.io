# -*- coding: utf-8 -*-
# ==========================================================================
# Testing prompts like software [generative-ai / Prompting and structured
# outputs]
# ==========================================================================
# WHAT IT IS
# A prompt change that fixes one case can break ten others. Build an
# evaluation set of 50–200 representative and tricky inputs with expected
# outputs or a scoring rubric; run every prompt or model change against it;
# track the pass rate, the cost and the latency. Example: prompt A passes
# 41/50 cases (82%), prompt B 46/50 (92%); with only 50 cases the 95%
# confidence interval of each is about ±10 points, so a 10-point gap is
# suggestive, not conclusive — add more cases. Keep a "golden" regression
# subset of past failures and review a sample of live outputs weekly.
#
# WHERE YOU USE IT
# Small evaluation sets give noisy comparisons: report the interval, not just
# the percentage.
#
# RUN IT:  python 08_prompt-7.py
#

import numpy as np

for passed in (41, 46):
    p = passed / 50
    half = 1.96 * np.sqrt(p * (1 - p) / 50)
    print(passed, round(p, 2), round(float(half), 3), (round(float(p - half), 2), round(float(p + half), 2)))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 41 0.82 0.106 (0.71, 0.93)
# 46 0.92 0.075 (0.84, 1.0)
