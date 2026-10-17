# -*- coding: utf-8 -*-
# ==========================================================================
# Policy, value function and model [reinforcement-learning / The reinforcement
# learning problem]
# ==========================================================================
# WHAT IT IS
# An RL agent may contain up to three components. A policy π(a | s) says what
# to do in each state. A value function says how good a state is (V) or a
# state–action pair (Q): the expected return when following the policy. A
# model predicts what the environment will do (next state and reward). Methods
# differ in which they keep: value-based (learn Q, act greedily), policy-based
# (learn π directly), actor–critic (both) and model-based (learn or use a
# model and plan with it). Model-free methods use none.
#
# WHERE YOU USE IT
# Value-based methods suit small discrete action sets; policy-based ones
# handle continuous actions and stochastic policies.
#
# RUN IT:  python 03_basics-2.py
#

policy = {"low": {"charge": 0.9, "work": 0.1}, "high": {"charge": 0.1, "work": 0.9}}
Q = {("low", "charge"): 2.0, ("low", "work"): 0.5, ("high", "charge"): 1.0, ("high", "work"): 3.0}
state = "low"
greedy = max(["charge", "work"], key=lambda a: Q[(state, a)])
print(policy[state], greedy)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# {'charge': 0.9, 'work': 0.1} charge
