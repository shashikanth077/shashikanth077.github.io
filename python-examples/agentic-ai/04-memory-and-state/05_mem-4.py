# -*- coding: utf-8 -*-
# ==========================================================================
# Memory risks: staleness, poisoning, privacy [agentic-ai / Memory and state]
# ==========================================================================
# WHAT IT IS
# Persistent memory creates new failure modes. Staleness: a remembered fact
# stops being true (the customer moved). Poisoning: an attacker gets a false
# or malicious note stored — through a web page the agent read or a document
# it summarised — and later behaviour changes. Leakage: memory from one user
# appears in another user's session. Over-reliance: the agent trusts an old
# note over fresh evidence. Mitigations: store source and timestamp with every
# entry; re-verify before acting on important facts; isolate memory per user
# and tenant; screen what gets written; and let fresh observations override
# memory. Test with planted false memories.
#
# WHERE YOU USE IT
# Treat memory as untrusted input that happens to come from your own database.
#
# RUN IT:  python 05_mem-4.py
#

memory = [{"fact": "customer address: Oak St 1", "source": "user", "age_days": 400}]
def usable(entry, max_age=90):
    return entry["source"] == "user" and entry["age_days"] <= max_age

print([usable(e) for e in memory])
print("re-verify before using:", memory[0]["fact"])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [False]
# re-verify before using: customer address: Oak St 1
