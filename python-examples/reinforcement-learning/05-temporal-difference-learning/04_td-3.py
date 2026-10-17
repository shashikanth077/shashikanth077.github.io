# -*- coding: utf-8 -*-
# ==========================================================================
# SARSA: on-policy TD control [reinforcement-learning / Temporal-difference
# learning]
# ==========================================================================
# WHAT IT IS
# Learn action values with the quintuple (s, a, r, s′, a′): Q(s, a) ← Q(s, a)
# + α [ r + γ Q(s′, a′) − Q(s, a) ] where a′ is the action the agent will
# actually take next (chosen ε-greedily). The agent learns the value of the
# policy it is really following, exploration included. Example: Q(s, a) = 0, r
# = 1, γ = 0.9, Q(s′, a′) = 1, α = 0.5: target 1 + 0.9 = 1.9, new Q = 0.95.
# SARSA is on-policy: if it explores, it learns to avoid risky states.
#
# WHERE YOU USE IT
# SARSA is the safer choice when mistakes during learning are costly.
#
# RUN IT:  python 04_td-3.py
#

Q_sa, r, gamma, q_next_chosen, alpha = 0.0, 1.0, 0.9, 1.0, 0.5
target = r + gamma * q_next_chosen
print(round(target, 2), round(Q_sa + alpha * (target - Q_sa), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1.9 0.95
