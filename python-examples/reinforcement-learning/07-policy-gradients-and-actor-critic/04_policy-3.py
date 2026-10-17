# -*- coding: utf-8 -*-
# ==========================================================================
# Actor–critic [reinforcement-learning / Policy gradients and actor–critic]
# ==========================================================================
# WHAT IT IS
# Combine both worlds. The actor is the policy π(a | s; θ); the critic is a
# value function V(s; w). The critic's TD error is a one-step estimate of the
# advantage: δ = r + γV(s′) − V(s). Update the critic towards the target (w ←
# w + α_w δ ∇V) and the actor along the policy gradient weighted by δ (θ ← θ +
# α_θ δ ∇log π(a | s)). Learning is online and low-variance, and no complete
# episode is needed. A2C/A3C, PPO, DDPG, TD3 and SAC are all actor–critic
# algorithms.
#
# WHERE YOU USE IT
# The critic's mistakes become the actor's gradient noise, so a good critic
# matters.
#
# RUN IT:  python 04_policy-3.py
#

r, gamma, V_s, V_next = 1.0, 0.9, 0.5, 0.6
delta = r + gamma * V_next - V_s
print(round(delta, 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1.04
