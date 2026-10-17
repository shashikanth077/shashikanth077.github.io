# -*- coding: utf-8 -*-
# ==========================================================================
# Reward design and shaping [reinforcement-learning / Models, rewards,
# multi-agent and RLHF]
# ==========================================================================
# WHAT IT IS
# Sparse rewards (only at the goal) make exploration hard; dense hints help
# but can backfire. Potential-based shaping adds F(s, s′) = γΦ(s′) − Φ(s) to
# the reward, with Φ a "progress" function such as minus the distance to the
# goal; it is the only form of shaping guaranteed to leave the optimal policy
# unchanged. Moving from a state with Φ = 2 to Φ = 3 at γ = 0.9 adds 0.9 × 3 −
# 2 = 0.7. Arbitrary bonuses ("+1 for moving toward the goal") can create
# loops that farm reward — reward hacking: the agent satisfies the letter of
# the reward, not your intent.
#
# WHERE YOU USE IT
# Always watch what the agent actually does; a rising return with absurd
# behaviour means the reward is wrong.
#
# RUN IT:  python 02_adv-1.py
#

gamma = 0.9
phi = {"far": 2.0, "near": 3.0}
print(round(gamma * phi["near"] - phi["far"], 3))
loop = gamma * phi["far"] - phi["near"]
print(round(loop + (gamma * phi["near"] - phi["far"]), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.7
# -0.5
