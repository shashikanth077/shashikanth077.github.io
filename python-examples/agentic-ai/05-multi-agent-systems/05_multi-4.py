# -*- coding: utf-8 -*-
# ==========================================================================
# Consensus and conflict between agents [agentic-ai / Multi-agent systems]
# ==========================================================================
# WHAT IT IS
# Agents can disagree. Resolution options: majority vote among peers (works
# for discrete answers; five independent agents at 0.7 accuracy give 0.837), a
# judge agent or a person for important cases, evidence-based resolution (each
# agent must cite sources, and sourced claims win) and authority by role (the
# security reviewer can veto). Beware of correlated errors: agents built from
# the same model and prompt often make the same mistake, so voting helps less
# than the independence maths suggests; diversity — different prompts, tools
# or models — restores some of it. Also beware of agreeable agents that simply
# echo each other.
#
# WHERE YOU USE IT
# Estimate how correlated your agents' errors are before counting on a vote.
#
# RUN IT:  python 05_multi-4.py
#

from collections import Counter

votes = ["A", "A", "B", "A", "B"]
print(Counter(votes).most_common(1)[0])
def majority(p, n):
    from math import comb
    return sum(comb(n, k) * p ** k * (1 - p) ** (n - k) for k in range(n // 2 + 1, n + 1))
print(round(majority(0.7, 5), 3), round(majority(0.7, 9), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ('A', 3)
# 0.837 0.901
