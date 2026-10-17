# -*- coding: utf-8 -*-
# ==========================================================================
# Parts of an agent [agentic-ai / What agents are]
# ==========================================================================
# WHAT IT IS
# A practical agent has six parts. The model reasons and chooses actions.
# Instructions (the system prompt) define role, rules and the stopping
# condition. Tools carry out actions and return observations. Memory keeps
# what matters beyond the context window. A planner or control loop (often
# just a while-loop with a step limit) drives the cycle. Guardrails and
# evaluation constrain and measure it. The model supplies judgement;
# everything else — tools, validation, limits, logging — is ordinary software,
# and it is where most reliability comes from.
#
# WHERE YOU USE IT
# Most agent bugs live in the tool descriptions, the loop limits and the data
# returned to the model — not in the model weights.
#
# RUN IT:  python 04_core-3.py
#

parts = {
    "model": "reasoning and choice of action",
    "instructions": "role, rules, stop condition",
    "tools": "act and observe",
    "memory": "state beyond the context window",
    "control loop": "while not done and steps < limit",
    "guardrails": "limits, validation, approvals, logging",
}
for k, v in parts.items():
    print(f"{k:13s} {v}")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# model         reasoning and choice of action
# instructions  role, rules, stop condition
# tools         act and observe
# memory        state beyond the context window
# control loop  while not done and steps < limit
# guardrails    limits, validation, approvals, logging
