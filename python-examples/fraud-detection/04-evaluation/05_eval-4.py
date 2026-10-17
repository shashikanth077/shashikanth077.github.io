# -*- coding: utf-8 -*-
# ==========================================================================
# Alert budgets: precision at k and reviewer capacity [fraud-detection /
# Evaluation]
# ==========================================================================
# WHAT IT IS
# Analysts can review only so many cases a day, so the question is not "what
# is the best threshold?" but "given capacity for k reviews, which k cases
# should they see?". Rank the day's flagged transactions by risk (or by
# expected loss, score × amount) and measure precision at k: of the top k, how
# many were fraud? The review queue is a budgeted resource: the right
# threshold moves with the volume of the day, and a good system fills the
# queue with the most valuable cases first. Ranking by expected loss beats
# ranking by score when amounts vary widely, because a 90 % risk on a 5
# payment is worth less attention than a 40 % risk on 5,000.
#
# WHERE YOU USE IT
# Set an alert budget per analyst-hour, rank by expected loss, and track
# precision at k and time-to-decision as service levels.
#
# RUN IT:  python 05_eval-4.py
#

import numpy as np
rng = np.random.default_rng(3)
n = 2000
fraud = rng.random(n) < 0.02
score = np.where(fraud, rng.beta(5, 2, n), rng.beta(1, 8, n))      # frauds score high on average
amount = np.where(fraud, rng.lognormal(5, 0.6, n), rng.lognormal(3.4, 0.8, n))
for name, key in (("by score", score), ("by score x amount", score * amount)):
    top = np.argsort(-key)[:30]
    print(f"{name:<18} precision@30 = {fraud[top].mean():.2f} | fraud value in queue = {amount[top][fraud[top]].sum():.0f}")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# by score           precision@30 = 0.97 | fraud value in queue = 5178
# by score x amount  precision@30 = 0.93 | fraud value in queue = 6473
