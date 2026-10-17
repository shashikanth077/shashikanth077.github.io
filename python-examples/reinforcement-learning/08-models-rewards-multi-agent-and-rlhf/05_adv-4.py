# -*- coding: utf-8 -*-
# ==========================================================================
# Where RL works, and where it does not [reinforcement-learning / Models,
# rewards, multi-agent and RLHF]
# ==========================================================================
# WHAT IT IS
# RL shines in games and simulation (Atari, Go, StarCraft), robotics in
# simulation, data-centre and network control, recommendation with long-term
# effects, chip layout, and fine-tuning language models. It struggles when
# mistakes are costly or irreversible, when no safe simulator exists, when
# feedback is rare, or when you already have plenty of labelled
# demonstrations. A good rule: try supervised learning or a bandit first;
# reach for full RL only if actions change future situations and you can
# afford many trials.
#
# WHERE YOU USE IT
# Real deployments add safety constraints, offline (batch) RL from logged
# data, and careful off-policy evaluation before any live test.
#
# RUN IT:  python 05_adv-4.py
#

cases = {
    "pick today's headline": "bandit (no state change)",
    "play Go": "RL with self-play",
    "predict house prices": "supervised learning",
    "tune a robot gait in simulation": "RL",
}
for k, v in cases.items():
    print(f"{k:32s} -> {v}")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# pick today's headline            -> bandit (no state change)
# play Go                          -> RL with self-play
# predict house prices             -> supervised learning
# tune a robot gait in simulation  -> RL
