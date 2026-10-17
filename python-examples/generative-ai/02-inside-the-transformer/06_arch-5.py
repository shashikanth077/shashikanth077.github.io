# -*- coding: utf-8 -*-
# ==========================================================================
# The KV cache: memory while generating [generative-ai / Inside the
# transformer]
# ==========================================================================
# WHAT IT IS
# Generating token n+1 needs the keys and values of all n earlier tokens at
# every layer. Recomputing them each step would be wasteful, so they are
# stored — the KV cache. Its size is 2 (K and V) × layers × heads × head_dim ×
# tokens × bytes. For 32 layers, 32 heads of 128 dimensions, 4,096 tokens in
# 16-bit: 2 × 32 × 32 × 128 × 4,096 × 2 bytes = 2.15 GB — for one
# conversation. With many users the cache, not the weights, limits throughput;
# grouped-query attention (fewer KV heads), quantised caches and paged memory
# (PagedAttention) reduce it.
#
# WHERE YOU USE IT
# Long contexts multiply cache memory linearly: a 128k context needs 32× the
# cache of a 4k one.
#
# RUN IT:  python 06_arch-5.py
#

def kv_cache(layers, heads, head_dim, tokens, bytes_per=2):
    return 2 * layers * heads * head_dim * tokens * bytes_per

base = kv_cache(32, 32, 128, 4096)
print(base, round(base / 1e9, 2), "GB")
print(round(kv_cache(32, 8, 128, 4096) / 1e9, 2), "GB with 8 KV heads (GQA)")
print(round(kv_cache(32, 32, 128, 128000) / 1e9, 1), "GB at 128k tokens")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 2147483648 2.15 GB
# 0.54 GB with 8 KV heads (GQA)
# 67.1 GB at 128k tokens
