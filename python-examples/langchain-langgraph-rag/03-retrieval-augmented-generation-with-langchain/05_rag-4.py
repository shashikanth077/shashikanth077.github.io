# -*- coding: utf-8 -*-
# ==========================================================================
# Hybrid RAG: rewrite, retrieve, validate [langchain-langgraph-rag /
# Retrieval-augmented generation with LangChain]
# ==========================================================================
# WHAT IT IS
# Hybrid RAG adds steps around the basic retrieve-and-generate: query
# enhancement (rewrite a chatty question into a good search query, or split it
# into several), retrieval validation (are the chunks relevant and sufficient?
# if not, rewrite and retry or widen k) and answer validation (is the answer
# supported by the chunks? does it cite them?). Loops need a limit — two or
# three iterations. In LangGraph this is a small graph: rewrite → retrieve →
# grade → (generate | rewrite again) → check. The grading steps can be cheap:
# a similarity threshold, a small model, or rules. Result: better answers on
# hard questions at moderate extra cost and a latency between 2-step and fully
# agentic.
#
# WHERE YOU USE IT
# A retrieval grader that says "not enough evidence" lets the system abstain
# instead of inventing an answer.
#
# RUN IT:  python 05_rag-4.py
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

def rewrite(q, attempt):
    return ["refund", "refund return days"][min(attempt, 1)] if "money" in q else q

def grade(docs, q):
    return any("refund" in d.page_content.lower() for d in docs)

question = "how fast do I get my money back"
for attempt in range(3):
    query = rewrite(question, attempt)
    docs = store.similarity_search(query, k=2)
    ok = grade(docs, question)
    print(attempt, repr(query), "relevant" if ok else "not relevant")
    if ok:
        break

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0 'refund' not relevant
# 1 'refund return days' relevant
