import { flow } from "../../visuals/kit.js";

/** A left-to-right flow where every step has a note. */
export const rowflow = (takeaway: string, nodes: string[], notes: string[]) =>
  flow(takeaway, "row", nodes, nodes.slice(1).map((_, i): [number, number] => [i, i + 1]), nodes.slice(1).map((_, i) => i), [`${notes[0] ?? ""} ${notes[1] ?? ""}`.trim(), ...notes.slice(2)]);

/**
 * Tiny, dependency-free stand-ins that mirror the shape of LangChain's building blocks so the
 * mechanics can be run offline: Document, a hashing "embedding" model, an in-memory vector
 * store with similarity_search, and a Runnable with the | operator.
 * (The real packages are not installed here; each concept names the real API it mirrors.)
 */
export const LIB = `
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
`;
