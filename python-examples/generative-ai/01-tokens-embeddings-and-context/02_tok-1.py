# -*- coding: utf-8 -*-
# ==========================================================================
# Tokens: the units a model reads [generative-ai / Tokens, embeddings and
# context]
# ==========================================================================
# WHAT IT IS
# Models do not see characters or words but tokens — sub-word pieces produced
# by a tokenizer such as byte-pair encoding. Common words are one token
# ("the"), rare words split ("unhappiness" → un · happi · ness), numbers and
# code split into many. A rule of thumb for English: 1 token ≈ 4 characters ≈
# 0.75 words, so 1,000 words ≈ 1,300 tokens; other languages and code often
# need 2–3× more. Tokens are what you pay for, what the context window limits
# and what the model predicts one at a time. Whitespace and casing matter: "
# the" and "the" can be different tokens.
#
# WHERE YOU USE IT
# Always count tokens with the model's own tokenizer before estimating cost or
# fitting a prompt into the context window.
#
# RUN IT:  python 02_tok-1.py
#

words = 1500
print(round(words / 0.75), "tokens (rule of thumb)")
text = "unhappiness"
pieces = ["un", "happi", "ness"]
print(len(text), "characters ->", len(pieces), "tokens", pieces)
print(round(1500 * 1.3), round(1500 * 2.5))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 2000 tokens (rule of thumb)
# 11 characters -> 3 tokens ['un', 'happi', 'ness']
# 1950 3750
