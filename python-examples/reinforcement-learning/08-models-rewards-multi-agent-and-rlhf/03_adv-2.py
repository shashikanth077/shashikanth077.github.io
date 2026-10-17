# -*- coding: utf-8 -*-
# ==========================================================================
# Multi-agent reinforcement learning [reinforcement-learning / Models,
# rewards, multi-agent and RLHF]
# ==========================================================================
# WHAT IT IS
# When several agents learn together, each one's environment includes the
# others, so it is non-stationary. Games capture the issue. In the prisoner's
# dilemma (payoffs: both cooperate 3,3; both defect 1,1; defect against a
# cooperator 5,0) defecting is the best reply whatever the other does, so
# (defect, defect) is the Nash equilibrium although (cooperate, cooperate)
# pays more for both. Settings: cooperative (shared reward), competitive
# (zero-sum, as in self-play for Go) and mixed. Techniques: centralised
# training with decentralised execution, communication, and population-based
# self-play.
#
# WHERE YOU USE IT
# Evaluate against a range of opponents, not only the one you trained with, to
# avoid brittle strategies.
#
# RUN IT:  python 03_adv-2.py
#

import numpy as np

payoff = {("C", "C"): (3, 3), ("C", "D"): (0, 5), ("D", "C"): (5, 0), ("D", "D"): (1, 1)}
for other in ("C", "D"):
    best = max("CD", key=lambda mine: payoff[(mine, other)][0])
    print("other plays", other, "-> best reply", best)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# other plays C -> best reply D
# other plays D -> best reply D
