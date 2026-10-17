# -*- coding: utf-8 -*-
# ==========================================================================
# HDBSCAN: persistent density groups [machine-learning / Clustering]
# ==========================================================================
# WHAT IT IS
# HDBSCAN removes DBSCAN's single global ε. It builds a hierarchy from mutual
# reachability d_m(p, q) = max(core_k(p), core_k(q), d(p, q)), prunes tiny
# branches and keeps the groups that persist across density levels (λ =
# 1/distance, higher λ = denser); it can still label noise. Example: core
# distances 1 and 2 and physical distance 1.5 give d_m = 2 and λ = 0.5. A
# branch born at λ = 0.5 whose three points leave at 1.2, 1.4, 1.4 has
# stability 0.7 + 0.9 + 0.9 = 2.5. Key parameters: min_cluster_size and
# min_samples (larger → more noise); selection by excess of mass or leaves.
#
# WHERE YOU USE IT
# Membership strength is not a probability of a real customer class.
# scikit-learn counts the point itself in min_samples; other packages do not,
# so check conventions before copying values.
#
# RUN IT:  python 17_cluster-21.py
#

core_p, core_q, d = 1.0, 2.0, 1.5
mr = max(core_p, core_q, d)
print(mr, 1 / mr, 1 / core_p)
birth, leave = 0.5, [1.2, 1.4, 1.4]
print(round(sum(l - birth for l in leave), 1), max(0.4, 0.8, 0.6))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 2.0 0.5 1.0
# 2.5 0.8
