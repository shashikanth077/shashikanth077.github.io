# -*- coding: utf-8 -*-
# ==========================================================================
# Why errors compound over many steps [agentic-ai / What agents are]
# ==========================================================================
# WHAT IT IS
# If each step succeeds with probability p and a task needs n steps, the
# chance of finishing without any mistake is pⁿ. With p = 0.95 and 10 steps:
# 0.95¹⁰ = 0.599; with 20 steps 0.358. Even p = 0.99 gives only 0.818 over 20
# steps. Long agent runs therefore fail far more often than their per-step
# accuracy suggests. Remedies: fewer, larger steps; verification after risky
# steps; retries and self-correction; checkpoints that allow resuming; and
# tools that do the exact work (calculators, parsers, tests) instead of
# free-form reasoning.
#
# WHERE YOU USE IT
# Measure end-to-end success on whole tasks, never only per-step accuracy.
#
# RUN IT:  python 05_core-4.py
#

for p in (0.99, 0.95, 0.9):
    print(p, [round(p ** n, 3) for n in (5, 10, 20)])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.99 [0.951, 0.904, 0.818]
# 0.95 [0.774, 0.599, 0.358]
# 0.9 [0.59, 0.349, 0.122]
