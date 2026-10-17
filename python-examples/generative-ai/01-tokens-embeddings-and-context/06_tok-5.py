# -*- coding: utf-8 -*-
# ==========================================================================
# Vocabulary size and embedding parameters [generative-ai / Tokens, embeddings
# and context]
# ==========================================================================
# WHAT IT IS
# The tokenizer's vocabulary V sets the size of the input embedding (V × d)
# and the output layer (d × V, often tied to the same matrix). GPT-2 has V =
# 50,257 and d = 768: 38.6 M parameters in embeddings — 31% of its 124 M.
# Larger vocabularies (100k–250k) shorten sequences (fewer tokens per text,
# cheaper attention) and help multilingual text, but enlarge the embedding
# matrices and the softmax over V at every generation step. Byte-level
# tokenizers never produce an unknown token because any text is a sequence of
# bytes.
#
# WHERE YOU USE IT
# For small models the vocabulary can dominate the parameter count: consider
# it when sizing a model.
#
# RUN IT:  python 06_tok-5.py
#

V, d = 50257, 768
emb = V * d
print(emb, round(emb / 124.3e6 * 100, 1), "% of 124.3M")
for V2 in (32000, 100000, 250000):
    print(V2, V2 * 4096 / 1e6, "M parameters at d = 4096")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 38597376 31.1 % of 124.3M
# 32000 131.072 M parameters at d = 4096
# 100000 409.6 M parameters at d = 4096
# 250000 1024.0 M parameters at d = 4096
