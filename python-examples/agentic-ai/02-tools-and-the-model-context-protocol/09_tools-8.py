# -*- coding: utf-8 -*-
# ==========================================================================
# Side effects and idempotency [agentic-ai / Tools and the Model Context
# Protocol]
# ==========================================================================
# WHAT IT IS
# Reading is safe to repeat; writing is not. If a retry sends the same e-mail
# twice or charges a card twice, the agent has caused damage. Make write tools
# idempotent: attach an idempotency key (a unique id per intended action) so
# that repeating the call with the same key has the same effect as doing it
# once. Separate read tools (free to call) from write tools (checked, logged,
# sometimes approved); prefer reversible actions (create a draft, not send);
# and record what was done so a restarted agent does not repeat it. Imagine
# the agent crashes after step 7 of 10: can you resume without redoing steps
# 1–7?
#
# WHERE YOU USE IT
# Idempotency keys turn "at least once" delivery into "exactly once" effects.
#
# RUN IT:  python 09_tools-8.py
#

done = {}

def charge(amount, key):
    if key in done:
        return done[key] + " (replayed)"
    done[key] = f"charged {amount}"
    return done[key]

print(charge(25, "order-77"))
print(charge(25, "order-77"))
print(len(done), "charge recorded")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# charged 25
# charged 25 (replayed)
# 1 charge recorded
