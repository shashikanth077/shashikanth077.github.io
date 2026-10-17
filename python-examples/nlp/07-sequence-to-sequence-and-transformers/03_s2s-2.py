# -*- coding: utf-8 -*-
# ==========================================================================
# Decoding: greedy versus beam search [nlp / Sequence-to-sequence and
# transformers]
# ==========================================================================
# WHAT IT IS
# Choosing the best word at every step (greedy) can miss the best sentence.
# Beam search keeps the B highest-probability partial sentences at each step.
# Toy two-step model: first word a 0.5, b 0.4, c 0.1; second word after a is x
# 0.4; after b is x 0.9. Greedy picks a then x: 0.5 × 0.4 = 0.20. Beam width 2
# keeps a and b, then finds "b x" = 0.4 × 0.9 = 0.36, the true best. Larger
# beams cost more and can prefer short, generic outputs, so a length penalty
# is common.
#
# WHERE YOU USE IT
# Beam search suits translation and speech; open-ended generation usually
# samples instead.
#
# RUN IT:  python 03_s2s-2.py
#

P1 = {"a": 0.5, "b": 0.4, "c": 0.1}
P2 = {"a": {"x": 0.4, "y": 0.3, "z": 0.3}, "b": {"x": 0.9, "y": 0.05, "z": 0.05}, "c": {"x": 0.5, "y": 0.5, "z": 0.0}}
first = max(P1, key=P1.get)
greedy = P1[first] * max(P2[first].values())
cands = sorted(((P1[a] * P2[a][b], a + b) for a in P1 for b in P2[a]), reverse=True)
print(first, round(greedy, 2), [(round(p, 2), s) for p, s in cands[:3]])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# a 0.2 [(0.36, 'bx'), (0.2, 'ax'), (0.15, 'az')]
