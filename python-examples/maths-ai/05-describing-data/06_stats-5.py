# -*- coding: utf-8 -*-
# ==========================================================================
# Samples, populations and bias [maths-ai / Describing data]
# ==========================================================================
# WHAT IT IS
# The population is everyone you care about; a sample is the part you actually
# measured. Sample statistics estimate population values — and a sample that
# over-represents some group (selection bias) misleads every model trained on
# it. The sample variance divides by n − 1, not n, to correct for estimating
# the mean from the same data.
#
# WHERE YOU USE IT
# A model is only as good as its training sample. Biased data produces biased
# predictions, however clever the algorithm.
#
# RUN IT:  python 06_stats-5.py
#

import statistics
data = [2, 4, 4, 4, 5, 5, 7, 9]
print(statistics.pvariance(data), round(statistics.variance(data), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 4 4.571
