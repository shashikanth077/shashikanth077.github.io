# -*- coding: utf-8 -*-
# ==========================================================================
# Drift: when the world moves under the model [fraud-detection / Operating it
# in production]
# ==========================================================================
# WHAT IT IS
# A fraud model is trained on yesterday's world and judged in tomorrow's. Data
# drift means the inputs change (a new payment method, a holiday, a shop's
# marketing campaign); concept drift means the link between inputs and fraud
# changes (attackers switch tactics). Since true labels lag by weeks, watch
# the inputs and the scores now: the Population Stability Index compares
# today's distribution of a feature or the score with a reference period, bin
# by bin: PSI = Σ (actual% − expected%) × ln(actual% / expected%). A common
# rule of thumb reads below 0.1 as stable, 0.1–0.25 as worth investigating and
# above 0.25 as a significant shift. Drift is a signal to look, not proof that
# the model is wrong — a campaign can shift traffic harmlessly.
#
# WHERE YOU USE IT
# Compute PSI daily for the score and the top features, by segment, and route
# alerts to a person who knows the business calendar.
#
# RUN IT:  python 01_ops-0.py
#

import numpy as np

def psi(expected, actual):
    e, a = np.array(expected, float), np.array(actual, float)
    return float(((a - e) * np.log(a / e)).sum())

reference = [0.50, 0.30, 0.20]              # share of transactions in three score bands last month
calm      = [0.48, 0.31, 0.21]
shifted   = [0.40, 0.30, 0.30]
broken    = [0.20, 0.30, 0.50]
for name, today in (("calm", calm), ("shifted", shifted), ("broken", broken)):
    print(f"{name:<8} PSI = {psi(reference, today):.3f}")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# calm     PSI = 0.002
# shifted  PSI = 0.063
# broken   PSI = 0.550
