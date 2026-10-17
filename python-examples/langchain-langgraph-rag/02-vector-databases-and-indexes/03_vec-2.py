# -*- coding: utf-8 -*-
# ==========================================================================
# Approximate nearest neighbours: recall versus speed [langchain-langgraph-rag
# / Vector databases and indexes]
# ==========================================================================
# WHAT IT IS
# ANN indexes trade a little accuracy for a lot of speed. They are judged by
# recall@k — what fraction of the true k nearest neighbours the index returns
# — against the work done (vectors scanned, latency). Two families dominate.
# Partition-based (IVF): cluster the vectors, search only the nearest
# clusters. Graph-based (HNSW): walk a layered proximity graph towards the
# query. Both expose a knob that moves along the curve: nprobe or ef_search.
# Higher means better recall and more time. Pick the setting from your own
# data: measure recall against an exact search on a sample of real queries,
# then choose the cheapest setting meeting your target (for example recall ≥
# 0.95).
#
# WHERE YOU USE IT
# Report recall together with latency; either number alone is meaningless.
#
# RUN IT:  python 03_vec-2.py
#

import numpy as np

truth = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
returned = {1, 2, 3, 4, 5, 6, 7, 8, 11, 12}
print(len(truth & returned) / len(truth))
approx_scanned, exact_scanned = 2000, 100000
print(exact_scanned / approx_scanned, "x fewer vectors compared")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.8
# 50.0 x fewer vectors compared
