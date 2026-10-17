# -*- coding: utf-8 -*-
# ==========================================================================
# Human approval: when to ask [agentic-ai / Safety, security and control]
# ==========================================================================
# WHAT IT IS
# Asking a person for every step makes the agent useless; asking for none is
# reckless. Ask when the expected loss of an error exceeds the cost of a
# review: loss = P(error) × cost of the mistake. If a wrong refund of 500
# happens 2% of the time the expected loss is 10 per decision — worth a
# 1-minute review (≈ 0.5); a 1-in-1,000 chance of a 100,000 mistake has
# expected loss 100. Cheap reversible steps (drafts, searches) need no
# approval. Show the reviewer the exact action and its effects (the e-mail
# text and recipients, the SQL and the rows affected), not just the model's
# summary, and measure approval rates: if people approve 99.9% blindly, the
# control is theatre.
#
# WHERE YOU USE IT
# Escalate by risk: auto-approve low risk, ask for medium, require two people
# for the highest.
#
# RUN IT:  python 03_safe-2.py
#

cases = {"refund 500": (0.02, 500), "wire 100k": (0.001, 100000), "draft e-mail": (0.05, 0)}
review_cost = 0.5
for name, (p, loss) in cases.items():
    print(f"{name:13s} expected loss {p * loss:7.2f}  ask a human: {p * loss > review_cost}")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# refund 500    expected loss   10.00  ask a human: True
# wire 100k     expected loss  100.00  ask a human: True
# draft e-mail  expected loss    0.00  ask a human: False
