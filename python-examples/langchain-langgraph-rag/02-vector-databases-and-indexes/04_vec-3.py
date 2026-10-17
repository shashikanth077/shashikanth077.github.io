# -*- coding: utf-8 -*-
# ==========================================================================
# IVF: search only the nearest clusters [langchain-langgraph-rag / Vector
# databases and indexes]
# ==========================================================================
# WHAT IT IS
# IVF (inverted file) splits the vectors into nlist clusters with k-means;
# every vector is stored in the list of its nearest centroid. A query finds
# its closest nprobe centroids and scans only those lists. On 20,000 vectors
# in 100 lists the experiment below gives: nprobe = 1 scans 1.5% of the data
# with recall@10 = 0.74; nprobe = 2 scans 2.4% with 0.93; nprobe = 4 scans
# 4.3% with 0.996; nprobe = 8 reaches 1.0 at 8.4%. The neighbours of a point
# often sit in a neighbouring list, which is why probing more than one helps.
# pgvector's advice for IVFFlat: lists = rows / 1000 up to a million rows
# (sqrt(rows) above) and probes ≈ sqrt(lists); build the index after the table
# has data.
#
# WHERE YOU USE IT
# Rebuild or retrain IVF when the data distribution drifts: stale centroids
# hurt recall.
#
# RUN IT:  python 04_vec-3.py
#

import numpy as np

rng = np.random.default_rng(0)
N, d, n_clusters = 20000, 32, 40
centers = rng.normal(size=(n_clusters, d)) * 3
X = centers[rng.integers(0, n_clusters, N)] + rng.normal(size=(N, d))
X /= np.linalg.norm(X, axis=1, keepdims=True)
Q = X[rng.choice(N, 100, replace=False)] + 0.02 * rng.normal(size=(100, d))
Q /= np.linalg.norm(Q, axis=1, keepdims=True)
truth = np.argsort(-(Q @ X.T), axis=1)[:, :10]

nlist = 100
cent = X[rng.choice(N, nlist, replace=False)].copy()
for _ in range(8):
    assign = np.argmax(X @ cent.T, axis=1)
    for c in range(nlist):
        members = X[assign == c]
        if len(members):
            m = members.mean(axis=0)
            cent[c] = m / np.linalg.norm(m)
assign = np.argmax(X @ cent.T, axis=1)

def ivf_search(q, nprobe, k=10):
    cells_ = np.argsort(-(cent @ q))[:nprobe]
    idx = np.where(np.isin(assign, cells_))[0]
    top = idx[np.argsort(-(X[idx] @ q))[:k]]
    return top, len(idx)
for nprobe in (1, 2, 4, 8):
    rec, scanned = [], []
    for i in range(len(Q)):
        top, n = ivf_search(Q[i], nprobe)
        rec.append(len(set(top) & set(truth[i])) / 10)
        scanned.append(n / N)
    print(nprobe, round(float(np.mean(rec)), 3), round(float(np.mean(scanned)), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1 0.744 0.015
# 2 0.928 0.024
# 4 0.996 0.043
# 8 1.0 0.084
