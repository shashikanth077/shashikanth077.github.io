# -*- coding: utf-8 -*-
# ==========================================================================
# Splitting text: chunk size and overlap [langchain-langgraph-rag /
# Retrieval-augmented generation with LangChain]
# ==========================================================================
# WHAT IT IS
# RecursiveCharacterTextSplitter is "the recommended TextSplitter for generic
# text use cases": it tries to split on paragraph breaks first, then lines,
# then spaces, then characters, so chunks end at natural boundaries.
# Parameters: chunk_size and chunk_overlap. The LangChain RAG tutorial uses
# chunk_size=1000 and chunk_overlap=200, which turned its loaded pages into
# 782 chunks. A 10,000-character document with those settings gives 1 +
# ⌈(10,000 − 1,000)/800⌉ = 13 chunks. Sizes are measured in characters by
# default (token-based length functions exist). Too small and a chunk lacks
# context; too large and the relevant sentence is diluted and the context
# window is wasted. Tune on your own questions by measuring retrieval recall.
#
# WHERE YOU USE IT
# Prefer splitting along document structure (headings, sections) when you have
# it; characters are the fallback.
#
# RUN IT:  python 02_rag-1.py
#

import math

def split_text(text, chunk_size=200, chunk_overlap=40, separators=("\n\n", "\n", " ", "")):
    """A small recursive splitter in the spirit of RecursiveCharacterTextSplitter."""
    def pieces(t, seps):
        if len(t) <= chunk_size or not seps:
            return [t]
        sep, rest = seps[0], seps[1:]
        parts = t.split(sep) if sep else list(t)
        out = []
        for p in parts:
            out += pieces(p, rest) if len(p) > chunk_size else [p]
        return out
    chunks, current = [], ""
    for p in pieces(text, list(separators)):
        if current and len(current) + 1 + len(p) > chunk_size:
            chunks.append(current)
            current = current[-chunk_overlap:] + " " + p if chunk_overlap else p
        else:
            current = (current + " " + p).strip() if current else p
    if current:
        chunks.append(current)
    return chunks
print(1 + math.ceil((10000 - 1000) / (1000 - 200)))
text = "Refunds are issued within 14 days. Premium customers receive refunds within 7 days.\n\nShipping takes 3 to 5 days. Express shipping takes 1 to 2 days. Orders above 50 EUR ship free."
chunks = split_text(text, chunk_size=80, chunk_overlap=20)
print(len(chunks))
for c in chunks:
    print(len(c), repr(c[:40]))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 13
# 3
# 77 'Refunds are issued within 14 days. Premi'
# 79 'ive refunds within 7 days. Shipping take'
# 62 'ess shipping takes 1 to 2 days. Orders a'
