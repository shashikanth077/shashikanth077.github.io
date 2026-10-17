# -*- coding: utf-8 -*-
# ==========================================================================
# Why agent safety is different [agentic-ai / Safety, security and control]
# ==========================================================================
# WHAT IT IS
# A chatbot's worst output is bad text; an agent's worst action is a deleted
# database, a leaked file or a sent e-mail. The risk is the action space
# multiplied by the model's fallibility and by exposure to untrusted content.
# Four sources of harm: the model misunderstands the goal, the model follows
# instructions hidden in data (prompt injection), a tool does more than
# intended, or the agent pursues the goal too literally ("clean up disk space"
# → deletes backups). Safety therefore comes from the system around the model:
# narrow permissions, validated actions, approvals for risky steps, sandboxes,
# limits and monitoring — defence in depth, because no single layer is
# reliable.
#
# WHERE YOU USE IT
# Assume the model will sometimes do the wrong thing and design so that the
# wrong thing is harmless.
#
# RUN IT:  python 01_safe-0.py
#

layers = ["narrow permissions", "argument validation", "human approval for risky actions", "sandbox", "budgets and limits", "monitoring and audit"]
print(len(layers), "layers; each assumed to fail sometimes")
p_fail = 0.1
print(round(p_fail ** len(layers[:3]), 6), "chance all of three independent layers fail")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 6 layers; each assumed to fail sometimes
# 0.001 chance all of three independent layers fail
