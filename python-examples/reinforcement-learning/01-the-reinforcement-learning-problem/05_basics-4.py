# -*- coding: utf-8 -*-
# ==========================================================================
# State values and action values [reinforcement-learning / The reinforcement
# learning problem]
# ==========================================================================
# WHAT IT IS
# V_π(s) is the expected return when starting in s and following π; Q_π(s, a)
# is the expected return after taking a in s and then following π. They are
# linked: V_π(s) = Σₐ π(a | s) Q_π(s, a). If in some state a policy picks
# "left" with probability 0.25 (Q = 2) and "right" with probability 0.75 (Q =
# 6), then V = 0.25×2 + 0.75×6 = 5. The best policy chooses the action with
# the largest Q in every state: V(s) = maxₐ Q(s, a).
#
# WHERE YOU USE IT
# Q is what lets a model-free agent act: it can pick the best action without
# knowing the environment's rules.
#
# RUN IT:  python 05_basics-4.py
#

pi = {"left": 0.25, "right": 0.75}
Q = {"left": 2.0, "right": 6.0}
V = sum(pi[a] * Q[a] for a in pi)
print(V, max(Q, key=Q.get))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 5.0 right
