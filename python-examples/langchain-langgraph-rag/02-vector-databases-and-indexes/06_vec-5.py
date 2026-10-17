# -*- coding: utf-8 -*-
# ==========================================================================
# Compression: quantisation and memory planning [langchain-langgraph-rag /
# Vector databases and indexes]
# ==========================================================================
# WHAT IT IS
# Memory, not CPU, often limits a vector database. Raw storage is N × d × 4
# bytes (float32): 1M × 1,536 → 6.1 GB; 1M × 768 → 3.1 GB. Halving precision
# (float16) halves it. Scalar quantisation stores each number in 8 bits (4×
# smaller). Product quantisation (PQ) splits a vector into sub-vectors and
# replaces each by the id of its nearest centroid: with 64 bytes per vector,
# 1M vectors need only 64 MB — a 96× reduction from 1,536 float32s — at the
# cost of some recall, often recovered by re-ranking the top candidates with
# the original vectors. Graph indexes add links: roughly 2m × 4 bytes ≈ 128
# bytes per vector for m = 16. Plan capacity from these numbers before
# choosing hardware.
#
# WHERE YOU USE IT
# Quantise only after measuring the recall loss on your own queries;
# re-ranking with full vectors usually restores most of it.
#
# RUN IT:  python 06_vec-5.py
#

N, d = 1_000_000, 1536
f32 = N * d * 4
print(round(f32 / 1e9, 2), "GB float32;", round(f32 / 2 / 1e9, 2), "GB float16;", round(f32 / 4 / 1e9, 2), "GB int8")
pq = N * 64
print(round(pq / 1e6), "MB with 64-byte PQ;", round(f32 / pq), "x smaller")
print(N * 2 * 16 * 4 / 1e6, "MB of HNSW links (m = 16)")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 6.14 GB float32; 3.07 GB float16; 1.54 GB int8
# 64 MB with 64-byte PQ; 96 x smaller
# 128.0 MB of HNSW links (m = 16)
