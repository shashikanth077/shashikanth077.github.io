# -*- coding: utf-8 -*-
# ==========================================================================
# Naive Bayes: combining evidence [maths-ai / Maths inside ML algorithms]
# ==========================================================================
# WHAT IT IS
# Naive Bayes classifies by Bayes' theorem, assuming the features are
# independent given the class: multiply the prior by each word's likelihood
# and compare the classes. P(spam | free, win) ∝ P(spam) · P(free | spam) ·
# P(win | spam). The independence assumption is naive but works surprisingly
# well for text.
#
# WHERE YOU USE IT
# A fast, strong baseline for spam filtering and text classification.
#
# RUN IT:  python 04_ml-3.py
#

prior_spam = 0.4
spam = prior_spam * 0.6 * 0.3                   # P(free|spam)=0.6, P(win|spam)=0.3
ham = (1 - prior_spam) * 0.05 * 0.02            # P(free|ham)=0.05, P(win|ham)=0.02
print(round(spam / (spam + ham), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.992
