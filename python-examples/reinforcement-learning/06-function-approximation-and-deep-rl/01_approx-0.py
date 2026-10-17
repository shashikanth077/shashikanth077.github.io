# -*- coding: utf-8 -*-
# ==========================================================================
# Why tables stop working [reinforcement-learning / Function approximation and
# deep RL]
# ==========================================================================
# WHAT IT IS
# A table holds one number per state (or state–action). That is fine for a 4 ×
# 12 grid (48 states) but hopeless for chess (≈ 10⁴⁴ positions), for Atari
# frames (256^(84×84) possible images) or for any continuous state. Even if
# memory were free, most states are never visited, and learning about one
# tells the table nothing about its neighbours. Function approximation
# replaces the table by a parametrised function V̂(s; w) or Q̂(s, a; w) —
# linear features or a neural network — that generalises: similar states get
# similar values and the number of parameters is far smaller than the number
# of states.
#
# WHERE YOU USE IT
# Generalisation is the gain, and the source of new problems: updating one
# state changes the values of many others.
#
# RUN IT:  python 01_approx-0.py
#

print(4 * 12, 2 ** 100)
states_visited = 10 ** 6
print(states_visited / 2 ** 100)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 48 1267650600228229401496703205376
# 7.888609052210118e-25
