# -*- coding: utf-8 -*-
# ==========================================================================
# Deep RL in practice [reinforcement-learning / Function approximation and
# deep RL]
# ==========================================================================
# WHAT IT IS
# Deep RL is sensitive. Habits that matter: normalise observations and scale
# or clip rewards; seed and average over many runs (results vary a lot between
# seeds); log learning curves and episode returns, not just loss; start with a
# tiny environment you can solve exactly; check the reward function for
# loopholes (reward hacking); and keep a simple baseline (random, heuristic,
# tabular) to compare against. Reproducibility is poor in the field, so report
# seeds, hyper-parameters and confidence intervals.
#
# WHERE YOU USE IT
# A learning curve that is not clearly above a random policy usually means a
# bug, not a hard problem.
#
# RUN IT:  python 06_approx-5.py
#

import numpy as np

rng = np.random.default_rng(0)
final_scores = rng.normal(100, 30, 10)
print(final_scores.round(0).tolist())
print(round(float(final_scores.mean()), 1), round(float(1.96 * final_scores.std(ddof=1) / np.sqrt(10)), 1))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [104.0, 96.0, 119.0, 103.0, 84.0, 111.0, 139.0, 128.0, 79.0, 62.0]
# 102.5 14.5
