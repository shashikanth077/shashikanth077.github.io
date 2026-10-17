# -*- coding: utf-8 -*-
# ==========================================================================
# Building a domain-specific classifier [nlp / Sentiment and text
# classification]
# ==========================================================================
# WHAT IT IS
# A practical recipe for a system such as "route support tickets": (1) define
# classes and collect examples from the real source; (2) label them carefully
# — measure annotator agreement; (3) split train / validation / test before
# looking at anything; (4) start with a TF-IDF + logistic regression baseline;
# (5) try a fine-tuned pretrained encoder only if the baseline is not enough;
# (6) inspect errors by hand and fix data first; (7) monitor live accuracy and
# retrain as language drifts. Most gains come from better data, not from a
# bigger model.
#
# WHERE YOU USE IT
# Annotation guidelines and error analysis are part of the model: write them
# down.
#
# RUN IT:  python 06_cls-5.py
#

steps = ["define classes", "collect and label", "split", "baseline", "fine-tune if needed", "error analysis", "monitor"]
for i, s in enumerate(steps, 1):
    print(i, s)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1 define classes
# 2 collect and label
# 3 split
# 4 baseline
# 5 fine-tune if needed
# 6 error analysis
# 7 monitor
