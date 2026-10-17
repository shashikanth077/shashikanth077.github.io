# -*- coding: utf-8 -*-
# ==========================================================================
# Audit, accountability and red-teaming [agentic-ai / Safety, security and
# control]
# ==========================================================================
# WHAT IT IS
# When an agent acts for people, someone must be able to answer: what did it
# do, why, on whose authority and with what result? Keep an append-only audit
# log of actions, arguments, approvals and outcomes; attach the user and the
# agent version; retain it per policy; protect it from the agent itself.
# Assign an owner for each agent and an incident process (how to switch it
# off, notify users, roll back). Red-team before launch: try prompt injection,
# jailbreaks, tool misuse, data leakage, runaway loops and edge cases; keep
# each successful attack as a regression test. Disclose to users when they are
# dealing with an agent and give them a way to reach a human.
#
# WHERE YOU USE IT
# Treat an agent like a new employee with a very fast typing speed: supervise,
# log and limit.
#
# RUN IT:  python 07_safe-6.py
#

import json, time

log = []
def audit(user, agent_version, action, args, outcome):
    entry = {"t": 1700000000 + len(log), "user": user, "agent": agent_version, "action": action, "args": args, "outcome": outcome}
    log.append(json.dumps(entry, sort_keys=True))

audit("anna", "v3", "send_email", {"to": "bob@example.com"}, "approved+sent")
print(log[0])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# {"action": "send_email", "agent": "v3", "args": {"to": "bob@example.com"}, "outcome": "approved+sent", "t": 1700000000, "user": "anna"}
