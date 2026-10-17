# -*- coding: utf-8 -*-
# ==========================================================================
# Data, information, knowledge, wisdom [machine-learning / The big picture]
# ==========================================================================
# WHAT IT IS
# Raw data (response times 4, 7, 3 minutes) is not yet useful. Information is
# data summarised so a person can read it ("the average was 4.67 minutes").
# Knowledge is a pattern with a reason ("tickets with outage words need fast
# action"). Wisdom is a decision that uses it ("keep a senior engineer free
# during peak outage hours"). Machine learning mostly turns data into
# information and knowledge; people supply the wisdom.
#
# WHERE YOU USE IT
# Always ask what decision a model's output will support. A perfect prediction
# nobody can act on is wasted work.
#
# RUN IT:  python 02_big-1.py
#

import numpy as np

times = np.array([4, 7, 3])
print(times.tolist())
print(round(float(times.mean()), 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [4, 7, 3]
# 4.67
