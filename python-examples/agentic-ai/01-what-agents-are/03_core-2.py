# -*- coding: utf-8 -*-
# ==========================================================================
# Levels of autonomy [agentic-ai / What agents are]
# ==========================================================================
# WHAT IT IS
# Autonomy is a dial, not a switch. Level 0: the model only suggests; a person
# acts. Level 1: the model drafts, the person approves each action. Level 2:
# the agent acts alone on low-risk steps and asks for approval on risky ones
# (sending money, deleting data, e-mailing customers). Level 3: the agent
# works for long stretches and reports at checkpoints. Level 4: fully
# autonomous within strict limits. Choose the level from the cost of a mistake
# and the reliability you have measured, and raise it gradually as evidence
# accumulates. Reversible, low-impact actions can be automated first.
#
# WHERE YOU USE IT
# Design the approval step so reviewers see exactly what will happen, not only
# the model's description of it.
#
# RUN IT:  python 03_core-2.py
#

actions = {"search the web": "low", "read a file": "low", "write a file": "medium", "send an e-mail": "high", "transfer money": "high"}
needs_approval = [a for a, risk in actions.items() if risk == "high"]
print(needs_approval)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ['send an e-mail', 'transfer money']
