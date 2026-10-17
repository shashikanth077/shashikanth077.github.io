# -*- coding: utf-8 -*-
# ==========================================================================
# Exact search: brute force and its cost [langchain-langgraph-rag / Vector
# databases and indexes]
# ==========================================================================
# WHAT IT IS
# The simplest vector search compares the query with every stored vector —
# exact (flat) k-nearest-neighbours. It is perfectly accurate and needs no
# index; its cost is N × d multiply-adds per query. For N = 10,000 and d = 768
# that is 7.7 million operations — milliseconds. For N = 10 million it is 7.7
# billion — far too slow for interactive use unless you have GPUs or accept
# latency. Memory is also N × d × 4 bytes in 32-bit floats: 1 million vectors
# of 1,536 dimensions take 6.1 GB. Exact search remains the right choice up to
# roughly a few hundred thousand vectors, and as the ground truth against
# which approximate indexes are measured.
#
# WHERE YOU USE IT
# Measure before building an index: at small scale a flat scan on a decent CPU
# is simpler and exactly right.
#
# RUN IT:  python 02_vec-1.py
#

N, d = 1_000_000, 1536
print(f"{N * d:,} multiply-adds per query")
print(round(N * d * 4 / 1e9, 2), "GB in float32;", round(N * d * 2 / 1e9, 2), "GB in float16")
import numpy as np
rng = np.random.default_rng(0)
X = rng.normal(size=(10000, 64)).astype("float32")
q = X[7]
print(int(np.argmax(X @ q)), X.nbytes / 1e6, "MB")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1,536,000,000 multiply-adds per query
# 6.14 GB in float32; 3.07 GB in float16
# 7 2.56 MB
