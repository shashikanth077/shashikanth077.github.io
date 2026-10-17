# -*- coding: utf-8 -*-
# ==========================================================================
# Multi-agent patterns [agentic-ai / Multi-agent systems]
# ==========================================================================
# WHAT IT IS
# Several agents can share one task. Orchestrator–worker: a lead agent splits
# the work, hands pieces to worker agents and merges their results — the most
# common and robust pattern. Pipeline: agents in sequence (researcher → writer
# → reviewer). Router: a small agent sends each request to a specialist.
# Debate or critic: agents propose and challenge each other's answers. Reasons
# to split: separate contexts keep each agent focused, different tools and
# permissions per role, parallel work, and specialised prompts. Reasons not
# to: coordination costs tokens and time, errors can multiply between agents,
# and a single agent with good tools is often enough.
#
# WHERE YOU USE IT
# Add agents only when one agent's context, tool set or speed is the proven
# bottleneck.
#
# RUN IT:  python 01_multi-0.py
#

def worker(subtask):
    return f"result of {subtask}"

def orchestrator(task):
    subtasks = [f"{task} / part {i}" for i in (1, 2, 3)]
    results = [worker(s) for s in subtasks]
    return " + ".join(results)

print(orchestrator("market research"))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# result of market research / part 1 + result of market research / part 2 + result of market research / part 3
