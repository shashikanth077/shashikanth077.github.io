# -*- coding: utf-8 -*-
# ==========================================================================
# Metadata filtering and its pitfalls [langchain-langgraph-rag / Vector
# databases and indexes]
# ==========================================================================
# WHAT IT IS
# Real queries combine similarity with conditions: "documents similar to this
# question, but only for tenant 7, language en, published after 2024". Stores
# accept a filter (LangChain: filter={"source": "tweets"} on
# similarity_search) — but support varies between implementations. Two
# strategies: pre-filtering restricts the candidates first (exact, but can be
# slow if the filter is not indexed) and post-filtering searches first and
# removes non-matching results afterwards, which can return fewer than k rows
# when the filter is selective — pgvector documents this for approximate
# indexes and offers iterative index scans (hnsw.iterative_scan,
# ivfflat.iterative_scan, version 0.8.0 onwards). Enforce access control
# inside the search: filtering after retrieval risks leaking which documents
# exist.
#
# WHERE YOU USE IT
# Index the metadata columns you filter on, and test with your most selective
# filters: they expose recall problems.
#
# RUN IT:  python 07_vec-6.py
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

emb = HashEmbeddings()
store = InMemoryVectorStore(emb)
store.add_documents([
    Document("refund policy for premium customers", {"tenant": "a"}),
    Document("refund policy for standard customers", {"tenant": "b"}),
    Document("shipping times for premium orders", {"tenant": "a"}),
    Document("refund request form", {"tenant": "b"}),
])
top = store.similarity_search("refund policy", k=2)
print([d.metadata["tenant"] for d in top])
post = [d for d in store.similarity_search("refund policy", k=2) if d.metadata["tenant"] == "a"]
pre = store.similarity_search("refund policy", k=2, filter={"tenant": "a"})
print(len(post), len(pre))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ['b', 'a']
# 1 2
