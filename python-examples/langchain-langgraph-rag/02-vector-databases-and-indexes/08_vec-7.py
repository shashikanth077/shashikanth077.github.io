# -*- coding: utf-8 -*-
# ==========================================================================
# pgvector: vectors inside PostgreSQL [langchain-langgraph-rag / Vector
# databases and indexes]
# ==========================================================================
# WHAT IT IS
# pgvector adds a vector(n) column type and similarity operators to
# PostgreSQL: <-> L2 distance, <=> cosine distance, <#> negative inner product
# (multiply by −1), plus L1, Hamming and Jaccard variants. A vector(n) costs
# 4n + 8 bytes; up to 16,000 dimensions can be stored and up to 2,000 indexed
# (halfvec up to 4,000). Indexes: CREATE INDEX ON items USING hnsw (embedding
# vector_cosine_ops) WITH (m = 16, ef_construction = 64); and USING ivfflat
# (embedding vector_cosine_ops) WITH (lists = 100). Query settings: SET
# hnsw.ef_search = 100 (default 40); SET ivfflat.probes = 10 (default 1).
# Benefits: one database for rows, filters, joins, transactions and vectors;
# backups and access control you already have. LangChain wraps it as PGVector
# / PGVectorStore.
#
# WHERE YOU USE IT
# For up to a few million vectors a well-tuned PostgreSQL with pgvector is
# often all you need.
#
# RUN IT:  python 08_vec-7.py
#

sql = """
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE chunks (id bigserial PRIMARY KEY, tenant text, content text, embedding vector(1536));
CREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
SET hnsw.ef_search = 100;
SELECT content FROM chunks WHERE tenant = 'a' ORDER BY embedding <=> $1 LIMIT 5;
"""
print(sql.strip().splitlines()[2])
print(1536 * 4 + 8, "bytes per vector(1536)")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# CREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
# 6152 bytes per vector(1536)
