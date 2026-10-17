# -*- coding: utf-8 -*-
# ==========================================================================
# Why evaluating generative models is hard [generative-ai / Evaluating
# generative systems]
# ==========================================================================
# WHAT IT IS
# A classifier has one right answer; a generator has many acceptable ones. Two
# summaries can both be good and share no words, so exact-match scores
# undercount quality, and fluent nonsense can fool surface metrics. Evaluate
# at several levels: task success on your own cases (does the extraction match
# the ground truth? does the code pass its tests?), properties (faithfulness,
# safety, tone, format validity) and human preference. Public benchmarks
# (MMLU, GSM8K, HumanEval) compare models in general but may be contaminated
# by training data and rarely match your use case — your own evaluation set is
# the one that matters.
#
# WHERE YOU USE IT
# Start the evaluation set before the product: ten real cases beat a hundred
# imagined ones.
#
# RUN IT:  python 01_evalu-0.py
#

scores = {"model A": {"benchmark": 0.82, "my task": 0.71}, "model B": {"benchmark": 0.79, "my task": 0.84}}
best_public = max(scores, key=lambda m: scores[m]["benchmark"])
best_mine = max(scores, key=lambda m: scores[m]["my task"])
print(best_public, best_mine)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# model A model B
