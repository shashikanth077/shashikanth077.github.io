# -*- coding: utf-8 -*-
# ==========================================================================
# Long-term memory: store, retrieve, score [agentic-ai / Memory and state]
# ==========================================================================
# WHAT IT IS
# To remember across sessions an agent writes notes to a store and retrieves
# them later. A retrieval score typically blends three things: similarity to
# the current situation, recency (an exponential decay such as 0.995^hours)
# and importance (rated when stored). Three memories: A (similarity 0.9, 2 h
# old, importance 0.3), B (0.6, 1 h, 0.9), C (0.8, 200 h, 0.5). Scores: A =
# 0.9 + 0.990 + 0.3 = 2.19; B = 0.6 + 0.995 + 0.9 = 2.495; C = 0.8 + 0.367 +
# 0.5 = 1.667. B is retrieved first although it is less similar: it is fresh
# and was marked important. Weights are tuned on real use.
#
# WHERE YOU USE IT
# Store facts (preferences, decisions, outcomes) rather than raw transcripts:
# they retrieve better and cost fewer tokens.
#
# RUN IT:  python 02_mem-1.py
#

memories = [("A", 0.9, 2, 0.3), ("B", 0.6, 1, 0.9), ("C", 0.8, 200, 0.5)]
scored = sorted(((round(sim + 0.995 ** hours + imp, 3), name) for name, sim, hours, imp in memories), reverse=True)
print(scored)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [(2.495, 'B'), (2.19, 'A'), (1.667, 'C')]
