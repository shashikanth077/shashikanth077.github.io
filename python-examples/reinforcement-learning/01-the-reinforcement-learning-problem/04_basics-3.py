# -*- coding: utf-8 -*-
# ==========================================================================
# Markov decision processes [reinforcement-learning / The reinforcement
# learning problem]
# ==========================================================================
# WHAT IT IS
# The standard mathematical model is a Markov decision process: states S,
# actions A, transition probabilities P(s′ | s, a), rewards R(s, a, s′) and
# discount γ. The Markov property says the next state depends only on the
# current state and action, not on the earlier history — so the state must
# contain everything relevant. Small example: from state "low" the action
# "work" gives reward 1 and stays low with probability 0.7 or moves to "high"
# with probability 0.3; the expected immediate reward of an action is Σ P(s′ |
# s, a) R. Using a stack of 4 game frames instead of one is a way of restoring
# the Markov property.
#
# WHERE YOU USE IT
# If the true state is hidden (a partially observable MDP), give the agent
# memory — frame stacks or a recurrent network.
#
# RUN IT:  python 04_basics-3.py
#

P = {("low", "work"): {"low": 0.7, "high": 0.3}, ("low", "charge"): {"low": 0.2, "high": 0.8}}
R = {("low", "work"): {"low": 1.0, "high": 1.0}, ("low", "charge"): {"low": 0.0, "high": 0.0}}
for sa in P:
    print(sa, round(sum(p * R[sa][s2] for s2, p in P[sa].items()), 2), sum(P[sa].values()))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ('low', 'work') 1.0 1.0
# ('low', 'charge') 0.0 1.0
