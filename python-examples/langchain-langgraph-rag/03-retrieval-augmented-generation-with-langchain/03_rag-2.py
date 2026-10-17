# -*- coding: utf-8 -*-
# ==========================================================================
# Two-step RAG: retrieve, then generate [langchain-langgraph-rag /
# Retrieval-augmented generation with LangChain]
# ==========================================================================
# WHAT IT IS
# The simplest architecture is 2-step RAG: retrieval always runs first, then
# one model call answers from the retrieved text. It has high control, low
# flexibility and fast, predictable latency — a known, capped number of LLM
# calls. In LangChain terms: question → retriever → prompt (context +
# question) → chat model → answer, a pipeline you can write with the |
# operator or as a small LangGraph with a retrieve node and a generate node.
# The prompt tells the model to answer only from the sources and to say when
# they do not contain the answer. Use it for FAQs, documentation search and
# any case where every question needs retrieval.
#
# WHERE YOU USE IT
# Return the retrieved chunks with the answer: users and evaluators need to
# see the evidence.
#
# RUN IT:  python 03_rag-2.py
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
retrieve = Runnable(lambda q: {"question": q, "docs": store.similarity_search(q, k=2)})
build_prompt = Runnable(lambda x: "Answer only from the sources.\n" + "\n".join(f"[{i + 1}] {d.page_content}" for i, d in enumerate(x["docs"])) + "\nQuestion: " + x["question"])
STOP = {"who", "is", "the", "how", "do", "does", "long", "a", "what", "are"}
def fake_llm_fn(prompt):
    sources, question = prompt.lower().split("question:")
    content = [w.strip("?.,") for w in question.split() if w.strip("?.,") not in STOP]
    grounded = any(w in sources for w in content)
    return "Refunds take 14 days (7 for premium) [1]." if grounded else "I could not find that in the sources."
fake_llm = Runnable(fake_llm_fn)
chain = retrieve | build_prompt | fake_llm
print(chain.invoke("How long do refunds take?"))
print(chain.invoke("Who is the CEO?"))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# Refunds take 14 days (7 for premium) [1].
# I could not find that in the sources.
