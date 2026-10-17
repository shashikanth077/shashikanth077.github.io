# -*- coding: utf-8 -*-
# ==========================================================================
# Checkpoints and durable execution [agentic-ai / Building and shipping
# agents]
# ==========================================================================
# WHAT IT IS
# Long-running agents face crashes, deployments, approvals that take hours and
# rate limits that force waiting. Durable execution saves the state after
# every step (a checkpoint) so the run can pause and resume exactly where it
# stopped, even on another machine. Requirements: serialisable state;
# idempotent tools so a replayed step does not repeat its effect; a store
# keyed by run id; a way to inject human input into a paused run. If a 20-step
# task crashes at step 14 and resumes from the checkpoint it repeats 0 steps
# instead of 14 — saving 70% of the work and all the repeated side effects.
# Time-travel debugging (re-run from any checkpoint with a changed prompt)
# comes almost free.
#
# WHERE YOU USE IT
# Design for "the process may die at any time" and most reliability problems
# become manageable.
#
# RUN IT:  python 03_build-2.py
#

import json

checkpoint = {"run_id": "r-9", "step": 14, "state": {"files_done": 12}}
saved = json.dumps(checkpoint)
resumed = json.loads(saved)
total, crashed_at = 20, 14
print(resumed["step"], "steps already done;", total - resumed["step"], "remain;", crashed_at, "steps saved vs a restart")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 14 steps already done; 6 remain; 14 steps saved vs a restart
