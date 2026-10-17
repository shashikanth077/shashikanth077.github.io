# -*- coding: utf-8 -*-
# ==========================================================================
# Association: which words occur together? [machine-learning / Text mining]
# ==========================================================================
# WHAT IT IS
# Among 100 tickets, 20 mention "refund", 30 mention "delay" and 15 mention
# both. Support(refund AND delay) = 15/100 = 0.15. Confidence(refund → delay)
# = 15/20 = 0.75. Lift = confidence / P(delay) = 0.75 / 0.30 = 2.5: the pair
# co-occurs 2.5 times as often as independence would suggest. Investigate
# representative messages, changes over time and confounders before deciding
# what caused the pattern.
#
# WHERE YOU USE IT
# Association is not causation. Templates, duplicates or one popular topic can
# create strong co-occurrence without a new operational problem.
#
# RUN IT:  python 13_text-16.py
#

n, refund, delay, both = 100, 20, 30, 15
support = both / n
confidence = both / refund
print(support, confidence, round(confidence / (delay / n), 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.15 0.75 2.5
