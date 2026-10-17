# -*- coding: utf-8 -*-
# ==========================================================================
# Freshness, updates and caching [generative-ai / Retrieval-augmented
# generation]
# ==========================================================================
# WHAT IT IS
# A RAG index is a database: it needs maintenance. Re-embed a document when it
# changes (track a content hash), delete chunks of removed documents, and
# store the embedding model version — switching models means re-embedding
# everything. Large documents may need incremental updates. Cache the
# expensive parts: embeddings of frequent queries, retrieval results for
# popular questions, and the model's response for identical prompts with
# temperature 0. Providers also cache long unchanging prompt prefixes at a
# discount, so put stable content (instructions, reference text) first and the
# variable question last.
#
# WHERE YOU USE IT
# Show document dates in answers: users need to know how current a source is.
#
# RUN IT:  python 07_rag-6.py
#

import hashlib

def digest(text):
    return hashlib.sha256(text.encode()).hexdigest()[:8]

index = {"policy.md": digest("refunds in 14 days")}
new = digest("refunds in 30 days")
print(index["policy.md"] != new, "-> re-embed policy.md")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# True -> re-embed policy.md
