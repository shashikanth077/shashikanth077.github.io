# -*- coding: utf-8 -*-
# ==========================================================================
# How RL differs from supervised learning [reinforcement-learning / The
# reinforcement learning problem]
# ==========================================================================
# WHAT IT IS
# Supervised learning gets the correct answer for every example. RL gets only
# an evaluative signal (a reward), often delayed, and the data depend on the
# agent's own behaviour: a bad policy visits bad states and learns about
# nothing else. Other differences: the credit-assignment problem (which of the
# last 1,000 actions earned this reward?), non-stationary data as the policy
# changes, and the need to explore. Where an expert supplies correct actions,
# imitation (supervised) learning is simpler and is often used to start an RL
# agent.
#
# WHERE YOU USE IT
# Use RL when the sequence of decisions matters and you can simulate or safely
# try actions; otherwise prefer supervised learning or bandits.
#
# RUN IT:  python 07_basics-6.py
#

supervised = [("image 1", "cat"), ("image 2", "dog")]
rl_episode = [("s0", "a0", 0.0), ("s1", "a1", 0.0), ("s2", "a2", 1.0)]
print(len(supervised), "labelled pairs;", "reward only at the end:", rl_episode[-1][2])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 2 labelled pairs; reward only at the end: 1.0
