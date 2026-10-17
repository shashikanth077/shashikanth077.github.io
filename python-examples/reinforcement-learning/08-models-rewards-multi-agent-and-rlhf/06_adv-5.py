# -*- coding: utf-8 -*-
# ==========================================================================
# Choosing an RL algorithm [reinforcement-learning / Models, rewards,
# multi-agent and RLHF]
# ==========================================================================
# WHAT IT IS
# A decision guide. Small discrete problem with a known model → value
# iteration. Small discrete, unknown model → Q-learning or SARSA. Large
# discrete actions with pixels → DQN variants. Continuous control → SAC or TD3
# (off-policy, sample-efficient) or PPO (stable, parallelisable). Need very
# high sample efficiency → model-based methods. Learning from fixed logs →
# offline RL. Language-model alignment → RLHF with PPO, or
# preference-optimisation methods. Whatever you pick, start with the simplest
# environment, a baseline, many seeds and learning curves.
#
# WHERE YOU USE IT
# Libraries (Gymnasium for environments, Stable-Baselines3, CleanRL) provide
# reference implementations: read them to see the details the papers omit.
#
# RUN IT:  python 06_adv-5.py
#

guide = {
    "small, model known": "value iteration",
    "small, model unknown": "Q-learning / SARSA",
    "pixels, discrete actions": "DQN family",
    "continuous control": "SAC / TD3 / PPO",
    "very few samples": "model-based RL",
    "fixed logged data": "offline RL",
}
for k, v in guide.items():
    print(f"{k:24s} -> {v}")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# small, model known       -> value iteration
# small, model unknown     -> Q-learning / SARSA
# pixels, discrete actions -> DQN family
# continuous control       -> SAC / TD3 / PPO
# very few samples         -> model-based RL
# fixed logged data        -> offline RL
