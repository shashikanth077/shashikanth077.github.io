# -*- coding: utf-8 -*-
# ==========================================================================
# Prompt caching: pay once for a stable prefix [building-with-claude / The
# Claude API]
# ==========================================================================
# WHAT IT IS
# When many requests share a long prefix (system prompt, documents, tool
# definitions), mark it with cache_control: {"type": "ephemeral"}. The first
# request writes the cache at a premium — 1.25× the base input price for the
# default 5-minute lifetime, 2× for a 1-hour lifetime — later requests read it
# at a fraction: 0.1× of base input price (0.05× on Opus 5.5 and Sonnet 5.5,
# 0.025× on Fable 5.1). Prompts below the minimum length (512 tokens on the
# current models) are simply not cached. The response usage shows
# cache_creation_input_tokens, cache_read_input_tokens and input_tokens (the
# uncached rest). Example on Sonnet 5.5 ($2): a 10,000-token prefix used 20
# times costs $0.40 uncached and $0.044 cached — about 9× cheaper.
#
# WHERE YOU USE IT
# Each use refreshes the lifetime for free; put the changing part (the user
# question) after the cached prefix.
#
# RUN IT:  python 08_api-7.py
#

base, tokens, n = 2.0, 10000, 20
uncached = n * tokens / 1e6 * base
cached = tokens / 1e6 * base * 1.25 + (n - 1) * tokens / 1e6 * base * 0.05
print(round(uncached, 3), round(cached, 4), round(uncached / cached, 1))
one_hour = tokens / 1e6 * base * 2 + (n - 1) * tokens / 1e6 * base * 0.05
print(round(one_hour, 4))
print("break-even after", 1, "read:", round(1.25 + 0.05, 2), "<", 2.0)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.4 0.044 9.1
# 0.059
# break-even after 1 read: 1.3 < 2.0
