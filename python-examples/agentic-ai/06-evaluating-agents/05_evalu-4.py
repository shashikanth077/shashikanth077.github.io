# -*- coding: utf-8 -*-
# ==========================================================================
# Benchmarks and sandboxes for agents [agentic-ai / Evaluating agents]
# ==========================================================================
# WHAT IT IS
# Agent benchmarks give a reproducible environment, tasks and an automatic
# checker: software-engineering tasks scored by tests, web-navigation tasks in
# a simulated site, customer-service simulations with scripted users and
# policy checks, command-line tasks verified by file state. They are useful
# for comparing models and prompts, but remember: public tasks may have leaked
# into training data; scores depend heavily on the scaffold (tools, prompts,
# step limits); success rates change with the number of attempts allowed; and
# they rarely match your domain. Build a small private benchmark from your
# real tasks inside a sandbox that can be reset between runs, and rerun it on
# every model, prompt or tool change.
#
# WHERE YOU USE IT
# Always state the scaffold, step limit, attempts and model version next to a
# benchmark score.
#
# RUN IT:  python 05_evalu-4.py
#

import copy

initial_state = {"files": {"a.txt": "old"}, "db_rows": 3}
state = copy.deepcopy(initial_state)
state["files"]["a.txt"] = "new"
state["db_rows"] += 1
print(state != initial_state)
state = copy.deepcopy(initial_state)
print(state == initial_state)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# True
# True
