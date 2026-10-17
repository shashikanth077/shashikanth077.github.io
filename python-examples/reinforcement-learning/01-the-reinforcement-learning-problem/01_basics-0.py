# -*- coding: utf-8 -*-
# ==========================================================================
# The agent–environment loop [reinforcement-learning / The reinforcement
# learning problem]
# ==========================================================================
# WHAT IT IS
# In reinforcement learning an agent learns by interacting with an
# environment. At every step the agent observes a state s, chooses an action
# a, and the environment answers with a reward r and a new state s′. Nobody
# tells the agent the right action; it only sees how well things went. The
# goal is to choose actions that maximise the total reward collected over
# time. A robot vacuum, a game-playing program, a trading bot and a chatbot
# tuned by human feedback all fit this loop.
#
# WHERE YOU USE IT
# The hard parts are not in the loop itself: rewards can arrive long after the
# action that caused them, and the agent's own choices decide which data it
# gets to see.
#
# RUN IT:  python 01_basics-0.py
#

import random

random.seed(0)
state, total = 0, 0
for t in range(5):
    action = random.choice(["left", "right"])
    next_state = state + (1 if action == "right" else -1)
    reward = 1 if next_state == 3 else 0
    print(t, state, action, "->", next_state, reward)
    state, total = next_state, total + reward
print("total reward", total)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0 0 right -> 1 0
# 1 1 right -> 2 0
# 2 2 left -> 1 0
# 3 1 right -> 2 0
# 4 2 right -> 3 1
# total reward 1
