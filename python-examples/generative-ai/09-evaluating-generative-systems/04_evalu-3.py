# -*- coding: utf-8 -*-
# ==========================================================================
# Hallucination: kinds and mitigation [generative-ai / Evaluating generative
# systems]
# ==========================================================================
# WHAT IT IS
# A model can state falsehoods fluently. Kinds: factual errors (a wrong date),
# fabrication (a citation or API that does not exist), unfaithfulness (a
# summary that adds claims not in the source), and reasoning slips. Causes:
# the training objective rewards plausible text, knowledge is compressed and
# incomplete, and the model rarely says "I don't know". Mitigations: ground
# answers in retrieved sources and require citations; ask the model to quote;
# allow and reward abstention; verify with tools (calculators, search, code
# execution); lower the temperature for facts; and check outputs automatically
# (does every cited URL exist?). Measure the rate on your own questions.
#
# WHERE YOU USE IT
# Design for the case where the model is wrong: confirmations, links to
# sources and easy human override.
#
# RUN IT:  python 04_evalu-3.py
#

answers = [("Paris is the capital", True), ("The treaty was signed in 1923", False), ("Water boils at 100 C at sea level", True), ("See doi:10.0000/xyz", False)]
rate = sum(not ok for _, ok in answers) / len(answers)
print(rate)
cited = ["doc1", "doc4"]
available = {"doc1", "doc2", "doc3"}
print([c for c in cited if c not in available])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.5
# ['doc4']
