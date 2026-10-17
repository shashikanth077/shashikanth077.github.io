# -*- coding: utf-8 -*-
# ==========================================================================
# Chain-of-thought and reasoning [generative-ai / Prompting and structured
# outputs]
# ==========================================================================
# WHAT IT IS
# Asking the model to reason step by step before answering (chain of thought)
# improves arithmetic, logic and multi-step problems, because intermediate
# tokens give it "room to compute": each generated token passes through a
# fixed amount of computation, so a long derivation uses much more. Question:
# "A shop sells 3 pens at 2 EUR each and 2 notebooks at 5 EUR each; what is
# the total?" Step by step: 3 × 2 = 6; 2 × 5 = 10; 6 + 10 = 16. Variants:
# self-consistency (sample several reasoning paths and take the majority
# answer), tool use for exact arithmetic, and dedicated "reasoning" models
# that think longer before answering. Costs: more output tokens and latency.
#
# WHERE YOU USE IT
# A reasoning trace is not guaranteed to be the true reason for an answer:
# verify results, especially numbers.
#
# RUN IT:  python 03_prompt-2.py
#

import numpy as np
from collections import Counter

answers = [16, 16, 15, 16, 14, 16, 16]
print(Counter(answers).most_common(1)[0], round(Counter(answers).most_common(1)[0][1] / len(answers), 2))
print(3 * 2 + 2 * 5)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# (16, 5) 0.71
# 16
