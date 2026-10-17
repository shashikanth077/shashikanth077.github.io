# -*- coding: utf-8 -*-
# ==========================================================================
# Labels: late, noisy and biased [fraud-detection / Data and features]
# ==========================================================================
# WHAT IT IS
# A model needs labels — "was this fraud?" — and they are the weakest part of
# the data. They arrive late: a cardholder notices a charge days or weeks
# later and disputes it, and chargebacks can take a month or more to settle;
# recent transactions look "legit" simply because nobody has complained yet.
# They are noisy: friendly fraud marks real purchases as fraud, and some real
# fraud is never reported. And they are biased: if you decline a payment you
# never learn whether it was fraud. So training data must be built from
# matured periods only, noisy labels need review or de-noising, and the
# feedback loop (see monitoring) needs deliberate exploration. The run shows
# how few frauds are known a few days after they happen.
#
# WHERE YOU USE IT
# Measure label delay per source (customer report, chargeback, analyst
# decision) and only train on transactions older than the point where most
# labels have arrived.
#
# RUN IT:  python 08_data-8.py
#

import numpy as np
rng = np.random.default_rng(1)
delay_days = rng.gamma(shape=2.0, scale=10.0, size=5000)      # days until a fraud is reported (mean 20)
for day in (1, 7, 14, 30, 60, 90):
    known = (delay_days <= day).mean()
    print(f"{day:>2} days after the fraud: {known * 100:5.1f}% of frauds are labelled")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
#  1 days after the fraud:   0.8% of frauds are labelled
#  7 days after the fraud:  15.6% of frauds are labelled
# 14 days after the fraud:  41.7% of frauds are labelled
# 30 days after the fraud:  80.5% of frauds are labelled
# 60 days after the fraud:  98.4% of frauds are labelled
# 90 days after the fraud:  99.8% of frauds are labelled
