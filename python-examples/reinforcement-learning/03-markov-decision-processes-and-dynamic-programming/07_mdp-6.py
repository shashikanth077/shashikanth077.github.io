# -*- coding: utf-8 -*-
# ==========================================================================
# The discount factor and the value of patience [reinforcement-learning /
# Markov decision processes and dynamic programming]
# ==========================================================================
# WHAT IT IS
# γ decides how much the future matters. A reward of 1 arriving k steps from
# now is worth γᵏ today: with γ = 0.9, ten steps away it is worth 0.349; with
# γ = 0.99 it is worth 0.904. The sum of an endless stream of 1s is 1/(1 − γ):
# 10 for γ = 0.9, 100 for γ = 0.99 — the effective horizon is about 1/(1 − γ)
# steps. A small γ gives greedy, short-sighted behaviour and fast learning; a
# large γ plans far ahead but makes learning slower and noisier. In episodic
# tasks γ = 1 is allowed because episodes end.
#
# WHERE YOU USE IT
# Choose γ from the timescale of the problem: a game of 10,000 steps needs a γ
# close to 1.
#
# RUN IT:  python 07_mdp-6.py
#

for gamma in (0.5, 0.9, 0.99):
    print(gamma, round(gamma ** 10, 3), round(1 / (1 - gamma), 1))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.5 0.001 2.0
# 0.9 0.349 10.0
# 0.99 0.904 100.0
