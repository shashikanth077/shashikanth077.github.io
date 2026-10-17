# -*- coding: utf-8 -*-
# ==========================================================================
# Choosing a vector database [langchain-langgraph-rag / Vector databases and
# indexes]
# ==========================================================================
# WHAT IT IS
# LangChain ships integrations for many stores — InMemoryVectorStore, Chroma,
# FAISS, PGVector, Pinecone, Qdrant, Weaviate, Milvus, Elasticsearch, Redis,
# MongoDB Atlas and others — behind the same VectorStore interface
# (add_documents, delete, similarity_search, a filter argument), but their
# capabilities differ (delete by id, filtering, search with scores, async,
# multi-tenancy). Decide by: scale (thousands vs hundreds of millions), where
# your data already lives (PostgreSQL, MongoDB, Elasticsearch), filtering and
# multi-tenancy needs, hybrid keyword + vector search, operations (managed
# service versus self-hosted), cost, and latency. Prototype with an in-memory
# store or Chroma, move to your production store through the interface, and
# test recall and filters there.
#
# WHERE YOU USE IT
# The interface hides syntax, not behaviour: re-run your retrieval evaluation
# after every store change.
#
# RUN IT:  python 09_vec-8.py
#

options = {
    "prototype / tests": "InMemoryVectorStore, Chroma",
    "already on PostgreSQL": "PGVector / pgvector",
    "very large, managed": "a managed service (e.g. Pinecone) or a distributed store (Milvus, Qdrant)",
    "keyword + vector in one search": "Elasticsearch or a store with hybrid search",
    "local, library-style ANN": "FAISS",
}
for need, choice in options.items():
    print(f"{need:34s} -> {choice}")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# prototype / tests                  -> InMemoryVectorStore, Chroma
# already on PostgreSQL              -> PGVector / pgvector
# very large, managed                -> a managed service (e.g. Pinecone) or a distributed store (Milvus, Qdrant)
# keyword + vector in one search     -> Elasticsearch or a store with hybrid search
# local, library-style ANN           -> FAISS
