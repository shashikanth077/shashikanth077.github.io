# -*- coding: utf-8 -*-
# ==========================================================================
# HNSW: a layered graph for fast navigation [langchain-langgraph-rag / Vector
# databases and indexes]
# ==========================================================================
# WHAT IT IS
# HNSW (hierarchical navigable small world) links each vector to a few near
# neighbours and stacks sparser and sparser graphs above. A query enters at
# the top layer, hops greedily to the node closest to the query, drops a
# layer, and repeats; at the bottom layer it explores more widely and keeps a
# candidate list of size ef_search. Each vector is assigned a top layer at
# random with probability about m⁻ˡ for layer l, so for m = 16 and one million
# vectors the layers hold roughly 1,000,000 → 62,500 → 3,900 → 244 → 15 nodes
# — long-range "highways" on top, local detail below. Build parameters: m
# (links per node, default 16 in pgvector) and ef_construction (default 64);
# query parameter hnsw.ef_search (default 40). Higher values give better
# recall, slower builds and queries, and more memory.
#
# WHERE YOU USE IT
# HNSW gives excellent recall at low latency but uses more memory than IVF and
# is slower to build; inserts are cheap, deletes are awkward.
#
# RUN IT:  python 05_vec-4.py
#

import numpy as np

m, N = 16, 1_000_000
rng = np.random.default_rng(0)
levels = np.floor(-np.log(rng.random(N)) / np.log(m)).astype(int)
print([int((levels >= l).sum()) for l in range(5)])
print([round(N / m ** l) for l in range(5)])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [1000000, 62397, 3937, 260, 15]
# [1000000, 62500, 3906, 244, 15]
