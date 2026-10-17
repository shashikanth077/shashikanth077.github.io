# -*- coding: utf-8 -*-
# ==========================================================================
# Measuring agents: task success first [agentic-ai / Evaluating agents]
# ==========================================================================
# WHAT IT IS
# The question is simple: how often does the agent complete the task
# correctly? Build a set of 50–200 realistic tasks, each with a way to check
# the outcome automatically (the file contains X, the test passes, the
# database row exists, the answer matches a rubric) and run the agent on all
# of them. Report the success rate with its uncertainty: 41 of 50 is 82%, with
# a 95% interval of about ±11 points (71–93%). Also report cost, steps and
# time per task. A demo that works three times proves nothing: variation
# between runs is large, so evaluate many tasks and, where it matters, several
# runs per task.
#
# WHERE YOU USE IT
# Write the checker before the agent: if you cannot tell whether a task
# succeeded, you cannot improve anything.
#
# RUN IT:  python 01_evalu-0.py
#

import numpy as np

n, s = 50, 41
p = s / n
half = 1.96 * np.sqrt(p * (1 - p) / n)
print(round(p, 2), round(float(half), 3), (round(float(p - half), 2), round(float(p + half), 2)))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.82 0.106 (0.71, 0.93)
