# -*- coding: utf-8 -*-
# ==========================================================================
# Retries, timeouts and back-off [agentic-ai / Tools and the Model Context
# Protocol]
# ==========================================================================
# WHAT IT IS
# Real tools fail: networks drop, services rate-limit, queries time out. Give
# every call a timeout, retry transient errors (timeouts, 429, 5xx) with
# exponential back-off plus jitter — waits of 1, 2, 4, 8 … seconds capped at
# 30 — and never retry blindly on errors that will repeat (invalid input,
# forbidden). If one attempt succeeds with probability p = 0.7, the expected
# number of attempts is 1/p = 1.43 and three attempts succeed with probability
# 1 − 0.3³ = 0.973 (two: 0.91). After the last attempt, return a clear failure
# to the model so it can choose another route or ask for help.
#
# WHERE YOU USE IT
# Retries multiply cost and delay: put a maximum on attempts and on total time
# per task.
#
# RUN IT:  python 04_tools-3.py
#

import random

p = 0.7
print(round(1 / p, 2), round(1 - (1 - p) ** 3, 3), round(1 - (1 - p) ** 2, 3))
random.seed(0)
waits = [round(min(2 ** k, 30) * (0.5 + random.random() / 2), 2) for k in range(6)]
print(waits)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1.43 0.973 0.91
# [0.92, 1.76, 2.84, 5.04, 12.09, 21.07]
