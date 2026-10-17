# -*- coding: utf-8 -*-
# ==========================================================================
# Q-learning: off-policy TD control [reinforcement-learning /
# Temporal-difference learning]
# ==========================================================================
# WHAT IT IS
# Q(s, a) ← Q(s, a) + α [ r + γ maxₐ′ Q(s′, a′) − Q(s, a) ]. The target uses
# the best next action, whatever the agent will actually do, so Q-learning
# learns the value of the greedy policy while behaving ε-greedily
# (off-policy). Same numbers as SARSA but with max Q(s′, ·) = 2: target 1 +
# 0.9 × 2 = 2.8, new Q = 0.5 × 2.8 = 1.4. It is the sampled form of the
# Bellman optimality equation and converges to Q if every pair is visited
# often enough and α decays suitably.
#
# WHERE YOU USE IT
# Q-learning's max also causes over-estimation with noisy values — the reason
# for Double Q-learning later.
#
# RUN IT:  python 05_td-4.py
#

Q_sa, r, gamma, max_next, alpha = 0.0, 1.0, 0.9, 2.0, 0.5
target = r + gamma * max_next
print(round(target, 2), round(Q_sa + alpha * (target - Q_sa), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 2.8 1.4
