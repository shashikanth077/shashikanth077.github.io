# -*- coding: utf-8 -*-
# ==========================================================================
# Text clustering and topic models [machine-learning / Text mining]
# ==========================================================================
# WHAT IT IS
# With no reliable labels: vectorise the six tickets, group nearby vectors,
# inspect representative texts, THEN name the groups. Cluster numbers 0, 1, 2
# have no inherent meaning. Choose a representation (TF–IDF for word overlap,
# embeddings for meaning) and a grouping rule (k-means for a fixed number of
# centre-based groups, hierarchical for nested structure, density methods for
# noise). For vectors (1, 1) and (1, 0) the centre is (1, 0.5) and SSE = 0.5.
# The toy tickets form three intuitive word-sharing groups (refund / delivery
# / password) — not a promise that every algorithm finds them. Topic models
# (LDA, NMF) expose groups of related terms with a mixture of topics per
# document, a different output from one cluster per document.
#
# WHERE YOU USE IT
# Sparse high-dimensional distances are hard: consider feature selection or
# TruncatedSVD, then verify the groups still make sense. A 2D plot is only a
# view. Compare partitions with the adjusted Rand index, not raw cluster-ID
# accuracy.
#
# RUN IT:  python 10_text-13.py
#

tickets = ["refund payment", "refund charge", "delivery late", "parcel delivery", "password login", "reset password"]
sets = [set(t.split()) for t in tickets]
groups = []
for i, s in enumerate(sets):
    for g in groups:
        if any(s & sets[j] for j in g):
            g.append(i)
            break
    else:
        groups.append([i])
print([[tickets[i] for i in g] for g in groups])
print(0 ** 2 + 0.5 ** 2 + 0 ** 2 + (-0.5) ** 2)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [['refund payment', 'refund charge'], ['delivery late', 'parcel delivery'], ['password login', 'reset password']]
# 0.5
