# -*- coding: utf-8 -*-
# ==========================================================================
# The context window and its cost [generative-ai / Tokens, embeddings and
# context]
# ==========================================================================
# WHAT IT IS
# The context window is the maximum number of tokens (input + output) a model
# can handle in one request: 4k, 8k, 128k, 1M and beyond. Everything the model
# should consider — instructions, history, retrieved documents, the question
# and the room for the answer — has to fit. Attention cost grows with the
# square of the length, so long prompts are slower and costlier even when
# allowed. A 6,000-token prompt with a 1,000-token answer needs 7,000 of an
# 8,000 window. Models also use the middle of a very long context less
# reliably than its start and end, so put key facts and instructions where
# they are seen.
#
# WHERE YOU USE IT
# Budget tokens explicitly: system prompt + history + retrieved text +
# question + reserved answer length.
#
# RUN IT:  python 05_tok-4.py
#

window, system, question, answer = 8000, 500, 100, 1000
room = window - system - question - answer
print(room, room // 500, "chunks of 500 tokens")
for n in (1000, 4000, 16000):
    print(n, n * n)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 6400 12 chunks of 500 tokens
# 1000 1000000
# 4000 16000000
# 16000 256000000
