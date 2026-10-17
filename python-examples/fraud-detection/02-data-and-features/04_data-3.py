# -*- coding: utf-8 -*-
# ==========================================================================
# Behaviour features: how different from this card's normal? [fraud-detection
# / Data and features]
# ==========================================================================
# WHAT IT IS
# A 400 purchase is ordinary for one customer and wildly odd for another, so
# fraud features are mostly deviations from the card's own history. The amount
# z-score (amount − mean) / standard deviation says how many "usual spreads"
# away it is. Ratios work too: amount ÷ the card's largest purchase in 90
# days. Novelty flags: first time at this merchant category, this country,
# this device, this hour. Compute them from past events only, keep running
# means and spreads cheaply (counts, sums, sums of squares), and give new
# cards a sensible default because they have no history. These "relative to
# normal" features usually beat raw amounts.
#
# WHERE YOU USE IT
# Store per-card running statistics (count, mean, variance) rather than raw
# history; they update in one step per event and fit in a few bytes.
#
# RUN IT:  python 04_data-3.py
#

import numpy as np
history = np.array([20, 25, 30, 22, 28.0])          # this card's past purchases
mean, sd = history.mean(), history.std()
for amount in (27, 60, 400):
    print(f"amount {amount:>3}: z = {(amount - mean) / sd:7.1f}")
print("mean", mean, "| spread", round(float(sd), 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# amount  27: z =     0.5
# amount  60: z =     9.5
# amount 400: z =   101.7
# mean 25.0 | spread 3.69
