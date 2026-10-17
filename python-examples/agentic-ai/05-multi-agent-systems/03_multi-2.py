# -*- coding: utf-8 -*-
# ==========================================================================
# Parallel agents and the speed-up limit [agentic-ai / Multi-agent systems]
# ==========================================================================
# WHAT IT IS
# Splitting a task across workers shortens it only for the parallel part.
# Amdahl's law: speed-up = 1 / ((1 − f) + f/k) where f is the parallelisable
# fraction and k the number of workers. If 80% of a task parallelises: 4
# workers give 1/(0.2 + 0.2) = 2.5×; 16 workers give 4×; even unlimited
# workers cap at 1/0.2 = 5×. The serial part — planning, merging, reviewing —
# becomes the bottleneck. Parallelism also multiplies cost: four workers each
# reading the same 10,000-token background use 40,000 input tokens instead of
# 10,000. Decide by value of time against value of tokens.
#
# WHERE YOU USE IT
# Parallelise the independent, expensive sub-tasks and keep the cheap serial
# steps simple.
#
# RUN IT:  python 03_multi-2.py
#

def speedup(f, k):
    return 1 / ((1 - f) + f / k)

print([round(speedup(0.8, k), 2) for k in (1, 2, 4, 16, 1000)], 1 / (1 - 0.8))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [1.0, 1.67, 2.5, 4.0, 4.98] 5.000000000000001
