# -*- coding: utf-8 -*-
# ==========================================================================
# Hallucination, grounding and evaluation [nlp / LLMs, responsibility and
# trends]
# ==========================================================================
# WHAT IT IS
# A language model optimised to produce plausible text can state falsehoods
# fluently — hallucination. Mitigations: ground answers in retrieved or
# provided sources (RAG) and require citations; constrain output formats; let
# the model abstain; verify claims with tools; and evaluate with test sets
# containing unanswerable and adversarial questions. Measure faithfulness
# (does the answer follow the sources?) separately from helpfulness. A fixed
# regression suite run on every prompt or model change catches silent
# degradations.
#
# WHERE YOU USE IT
# For high-stakes domains keep a human in the loop; the cost of one confident
# error can exceed the savings.
#
# RUN IT:  python 02_now-1.py
#

answers = [("capital of Lithuania?", "Vilnius", True), ("capital of Atlantis?", "Poseidonis", False)]
supported = sum(ok for _, _, ok in answers)
print(supported, "of", len(answers), "answers supported by sources ->", supported / len(answers))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1 of 2 answers supported by sources -> 0.5
