# -*- coding: utf-8 -*-
# ==========================================================================
# Runnables and the | operator (LCEL) [langchain-langgraph-rag / LangChain:
# models, tools, runnables and agents]
# ==========================================================================
# WHAT IT IS
# LangChain's composition model is the Runnable: an object with invoke, batch
# and stream (and async versions). Runnables are chained with the pipe
# operator — the LangChain Expression Language, LCEL: prompt | model | parser.
# A dict inside a pipe becomes a parallel branch: every key's runnable
# receives the same input and the results are collected into a dict. A plain
# Python function is wrapped with RunnableLambda. Anything composed this way
# gets synchronous, asynchronous, batch and streaming behaviour automatically.
# The idea is the same as Unix pipes or functional composition: small steps
# with one input and one output, combined into a pipeline.
#
# WHERE YOU USE IT
# LCEL is most useful for fixed pipelines; for loops, branching and state use
# LangGraph.
#
# RUN IT:  python 03_lc-2.py
#

import math
import re
from dataclasses import dataclass, field

import numpy as np


@dataclass
class Document:
    page_content: str
    metadata: dict = field(default_factory=dict)


class HashEmbeddings:
    """A toy embedding model: hashed bag of words, unit length (stands in for a real model)."""

    def __init__(self, dim=64):
        self.dim = dim

    def _vec(self, text):
        v = np.zeros(self.dim)
        for w in re.findall(r"[a-z0-9]+", text.lower()):
            v[sum(ord(c) * (i + 1) for i, c in enumerate(w)) % self.dim] += 1.0
        n = np.linalg.norm(v)
        return v / n if n else v

    def embed_documents(self, texts):
        return [self._vec(t) for t in texts]

    def embed_query(self, text):
        return self._vec(text)


class InMemoryVectorStore:
    """Mirrors the VectorStore interface: add_documents, similarity_search, delete."""

    def __init__(self, embedding):
        self.embedding = embedding
        self.docs, self.vecs, self.ids = [], [], []

    def add_documents(self, documents, ids=None):
        ids = ids or [f"id-{len(self.docs) + i}" for i in range(len(documents))]
        self.docs += documents
        self.vecs += self.embedding.embed_documents([d.page_content for d in documents])
        self.ids += ids
        return ids

    def similarity_search(self, query, k=4, filter=None):
        q = self.embedding.embed_query(query)
        scored = sorted(((float(v @ q), i) for i, v in enumerate(self.vecs)), reverse=True)
        out = []
        for score, i in scored:
            if filter and any(self.docs[i].metadata.get(a) != b for a, b in filter.items()):
                continue
            out.append(self.docs[i])
            if len(out) == k:
                break
        return out

    def delete(self, ids):
        keep = [i for i, x in enumerate(self.ids) if x not in set(ids)]
        self.docs = [self.docs[i] for i in keep]
        self.vecs = [self.vecs[i] for i in keep]
        self.ids = [self.ids[i] for i in keep]


class Runnable:
    """Mirrors langchain-core's Runnable: invoke(), batch(), and composition with |."""

    def __init__(self, fn):
        self.fn = fn

    def invoke(self, x):
        return self.fn(x)

    def batch(self, xs):
        return [self.invoke(x) for x in xs]

    def __or__(self, other):
        other = other if isinstance(other, Runnable) else (Runnable(other) if callable(other) else Parallel(other))
        return Runnable(lambda x: other.invoke(self.invoke(x)))


class Parallel(Runnable):
    """A dict of runnables: every branch receives the same input."""

    def __init__(self, branches):
        self.branches = {k: (v if isinstance(v, Runnable) else Runnable(v)) for k, v in branches.items()}
        super().__init__(lambda x: {k: r.invoke(x) for k, r in self.branches.items()})

clean = Runnable(lambda s: s.strip().lower())
count = Runnable(lambda s: len(s.split()))
shout = Runnable(lambda s: s.upper())
chain = clean | {"words": count, "loud": shout}
print(chain.invoke("  Hello LangChain World "))
print(chain.batch(["a b", "c d e"]))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# {'words': 3, 'loud': 'HELLO LANGCHAIN WORLD'}
# [{'words': 2, 'loud': 'A B'}, {'words': 3, 'loud': 'C D E'}]
