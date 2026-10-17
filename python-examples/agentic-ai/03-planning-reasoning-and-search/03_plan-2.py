# -*- coding: utf-8 -*-
# ==========================================================================
# Decomposition: tasks as a dependency graph [agentic-ai / Planning, reasoning
# and search]
# ==========================================================================
# WHAT IT IS
# Many tasks split into sub-tasks with dependencies, a directed acyclic graph.
# Example: A (gather data) must precede B (clean it) and C (fetch benchmarks);
# D (report) needs both B and C. Execution order is any topological order: A,
# B, C, D. Independent tasks (B and C) can run in parallel. With durations A =
# 2, B = 3, C = 5, D = 1 the sequential time is 11, but the critical path A →
# C → D takes 2 + 5 + 1 = 8: that is the best possible time with unlimited
# workers. Agents that expose the graph can parallelise, retry one branch
# without redoing the others and report progress.
#
# WHERE YOU USE IT
# Model the dependency graph explicitly when sub-tasks are expensive: it also
# tells you where to place checkpoints.
#
# RUN IT:  python 03_plan-2.py
#

deps = {"A": [], "B": ["A"], "C": ["A"], "D": ["B", "C"]}
dur = {"A": 2, "B": 3, "C": 5, "D": 1}
finish = {}
for task in ["A", "B", "C", "D"]:
    start = max((finish[d] for d in deps[task]), default=0)
    finish[task] = start + dur[task]
print(finish, sum(dur.values()), finish["D"])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# {'A': 2, 'B': 5, 'C': 7, 'D': 8} 11 8
