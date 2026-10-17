# -*- coding: utf-8 -*-
# ==========================================================================
# Agentic RAG: the model decides when to retrieve [langchain-langgraph-rag /
# Retrieval-augmented generation with LangChain]
# ==========================================================================
# WHAT IT IS
# In agentic RAG retrieval is a tool: an agent decides whether to search, what
# query to use, whether the results suffice and whether to search again —
# useful for multi-part questions ("compare the refund rules for premium and
# standard customers"), follow-ups and chit-chat that needs no retrieval. The
# LangChain docs summarise the trade-off: 2-step RAG has high control, low
# flexibility and fast latency; agentic RAG has low control, high flexibility
# and variable latency; hybrid RAG sits in between. Costs: more model calls,
# less predictable latency, harder testing. Guard it with a step limit, a
# clear tool description and evaluation of whole trajectories.
#
# WHERE YOU USE IT
# Choose agentic RAG when questions vary a lot in how much retrieval they
# need; otherwise 2-step is cheaper and easier to test.
#
# RUN IT:  python 04_rag-3.py
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


handbook = [
    Document("Refunds are issued within 14 days of a return request. Premium customers receive refunds within 7 days.", {"source": "refunds.md"}),
    Document("Standard shipping takes 3 to 5 business days. Express shipping takes 1 to 2 business days.", {"source": "shipping.md"}),
    Document("Support is available on weekdays from 9:00 to 17:00. Premium customers have a 24/7 chat line.", {"source": "support.md"}),
    Document("Orders above 50 EUR ship for free within the European Union.", {"source": "shipping.md"}),
]
store = InMemoryVectorStore(HashEmbeddings())
store.add_documents(handbook)
calls = []
def search_handbook(query: str) -> str:
    """Search the company handbook. Use for questions about refunds, shipping or support."""
    calls.append(query)
    return " | ".join(d.page_content[:40] for d in store.similarity_search(query, k=1))

def scripted_agent(question):
    if "hello" in question.lower():
        return "Hello! How can I help?"
    out = [search_handbook(q.strip()) for q in question.split(" and ")]
    return " || ".join(out)

print(scripted_agent("hello"), calls)
print(scripted_agent("refund policy and express shipping time"), calls)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# Hello! How can I help? []
# Refunds are issued within 14 days of a r || Support is available on weekdays from 9: ['refund policy', 'express shipping time']
