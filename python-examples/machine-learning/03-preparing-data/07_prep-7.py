# -*- coding: utf-8 -*-
# ==========================================================================
# Outliers: investigate before deleting [machine-learning / Preparing data]
# ==========================================================================
# WHAT IT IS
# An outlier is an unusually distant observation. It can be a data error
# (€120,000 typed instead of €12,000), a rare but genuine customer (a business
# account among households), or an important event (fraud, a promotion).
# Deleting automatically can throw away the cases you most want to understand.
# Flag it, look at the original record, compare with domain rules, then
# correct, cap (clip), transform (for example log), keep or model it
# separately — and document the decision.
#
# WHERE YOU USE IT
# A cap or log transform reduces the pull of extreme values on means and on
# distance-based models without losing the row.
#
# RUN IT:  python 07_prep-7.py
#

import numpy as np

spend = np.array([2400, 2800, 2600, 12000, 11000, 120000])
q1, q3 = np.percentile(spend, [25, 75])
cap = q3 + 1.5 * (q3 - q1)
print(spend[spend > cap].tolist(), cap)
print(np.clip(spend, None, cap).max(), round(float(np.log10(spend.max())), 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [120000] 25400.0
# 25400.0 5.08
