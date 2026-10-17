# -*- coding: utf-8 -*-
# ==========================================================================
# The Bellman expectation equation [reinforcement-learning / Markov decision
# processes and dynamic programming]
# ==========================================================================
# WHAT IT IS
# The recursion Gₜ = Rₜ₊₁ + γGₜ₊₁ turns into an equation for values: V_π(s) =
# Σₐ π(a | s) Σₛ′ P(s′ | s, a) [ r + γ V_π(s′) ]. In words: a state is worth
# the average, over what the policy does and what the world does, of the
# immediate reward plus the discounted value of where you land. Example: from
# state s the policy picks a₁ (50%) or a₂ (50%); a₁ gives r = 1 and lands in a
# state of value 4, a₂ gives r = 0 and lands in a state of value 6; with γ =
# 0.9: V = 0.5(1 + 3.6) + 0.5(0 + 5.4) = 5.0.
#
# WHERE YOU USE IT
# Every dynamic-programming, temporal-difference and Monte Carlo method is a
# different way of solving or sampling this one equation.
#
# RUN IT:  python 01_mdp-0.py
#

gamma = 0.9
branches = [(0.5, 1.0, 4.0), (0.5, 0.0, 6.0)]
V = sum(p * (r + gamma * v_next) for p, r, v_next in branches)
print(round(V, 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 5.0
