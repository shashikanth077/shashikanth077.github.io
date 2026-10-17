# -*- coding: utf-8 -*-
# ==========================================================================
# Standardisation: z-scores [maths-ai / Describing data]
# ==========================================================================
# WHAT IT IS
# A z-score re-expresses a value as "how many standard deviations from the
# mean": z = (x − mean) / σ. After standardising, every feature has mean 0 and
# standard deviation 1, so no feature dominates just because its numbers are
# bigger (age 0–100 versus salary 0–100,000).
#
# WHERE YOU USE IT
# Standardise inputs before gradient descent and distance-based models; it
# makes training faster and fairer across features.
#
# RUN IT:  python 03_stats-2.py
#

mean, std = 5, 2
print([(m - mean) / std for m in [2, 5, 9]])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [-1.5, 0.0, 2.0]
