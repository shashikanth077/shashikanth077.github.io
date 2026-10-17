# langchain-langgraph-rag — Python examples

One small, commented script per concept. Run any file with `python <file>`.

| Concept | File |
|---|---|
| What LangChain is, and where it sits | `01-langchain-models-tools-runnables-and-agents/01_lc-0.py` |
| Messages and chat models | `01-langchain-models-tools-runnables-and-agents/02_lc-1.py` |
| Runnables and the / operator (LCEL) | `01-langchain-models-tools-runnables-and-agents/03_lc-2.py` |
| Prompt templates and structured output | `01-langchain-models-tools-runnables-and-agents/04_lc-3.py` |
| Tools: functions the model can call | `01-langchain-models-tools-runnables-and-agents/05_lc-4.py` |
| create_agent: the loop in one call | `01-langchain-models-tools-runnables-and-agents/06_lc-5.py` |
| Middleware: behaviour around the agent loop | `01-langchain-models-tools-runnables-and-agents/07_lc-6.py` |
| When to use LangChain — and when not to | `01-langchain-models-tools-runnables-and-agents/08_lc-7.py` |
| Embeddings and distance metrics | `02-vector-databases-and-indexes/01_vec-0.py` |
| Exact search: brute force and its cost | `02-vector-databases-and-indexes/02_vec-1.py` |
| Approximate nearest neighbours: recall versus speed | `02-vector-databases-and-indexes/03_vec-2.py` |
| IVF: search only the nearest clusters | `02-vector-databases-and-indexes/04_vec-3.py` |
| HNSW: a layered graph for fast navigation | `02-vector-databases-and-indexes/05_vec-4.py` |
| Compression: quantisation and memory planning | `02-vector-databases-and-indexes/06_vec-5.py` |
| Metadata filtering and its pitfalls | `02-vector-databases-and-indexes/07_vec-6.py` |
| pgvector: vectors inside PostgreSQL | `02-vector-databases-and-indexes/08_vec-7.py` |
| Choosing a vector database | `02-vector-databases-and-indexes/09_vec-8.py` |
| The ingestion pipeline: load, split, embed, store | `03-retrieval-augmented-generation-with-langchain/01_rag-0.py` |
| Splitting text: chunk size and overlap | `03-retrieval-augmented-generation-with-langchain/02_rag-1.py` |
| Two-step RAG: retrieve, then generate | `03-retrieval-augmented-generation-with-langchain/03_rag-2.py` |
| Agentic RAG: the model decides when to retrieve | `03-retrieval-augmented-generation-with-langchain/04_rag-3.py` |
| Hybrid RAG: rewrite, retrieve, validate | `03-retrieval-augmented-generation-with-langchain/05_rag-4.py` |
| MMR: relevant but not redundant | `03-retrieval-augmented-generation-with-langchain/06_rag-5.py` |
| Evaluating and debugging a RAG system | `03-retrieval-augmented-generation-with-langchain/07_rag-6.py` |
| Why LangGraph: agents as stateful graphs | `04-langgraph-stateful-graphs-memory-and-human-in-the-loop/01_lg-0.py` |
| State and reducers | `04-langgraph-stateful-graphs-memory-and-human-in-the-loop/02_lg-1.py` |
| Nodes, edges and super-steps | `04-langgraph-stateful-graphs-memory-and-human-in-the-loop/03_lg-2.py` |
| Conditional edges: routing at run time | `04-langgraph-stateful-graphs-memory-and-human-in-the-loop/04_lg-3.py` |
| The tool-calling agent as a graph | `04-langgraph-stateful-graphs-memory-and-human-in-the-loop/05_lg-4.py` |
| Parallelism, recursion limits and runaway loops | `04-langgraph-stateful-graphs-memory-and-human-in-the-loop/06_lg-5.py` |
| Send: dynamic fan-out and orchestrator–worker | `04-langgraph-stateful-graphs-memory-and-human-in-the-loop/07_lg-6.py` |
| Checkpointers and threads: persistence | `04-langgraph-stateful-graphs-memory-and-human-in-the-loop/08_lg-7.py` |
| Interrupts: human-in-the-loop | `04-langgraph-stateful-graphs-memory-and-human-in-the-loop/09_lg-8.py` |
| Memory: checkpointer versus store | `04-langgraph-stateful-graphs-memory-and-human-in-the-loop/10_lg-9.py` |
| Workflow patterns as graphs | `04-langgraph-stateful-graphs-memory-and-human-in-the-loop/11_lg-10.py` |
| Multi-agent graphs: supervisor and sub-graphs | `04-langgraph-stateful-graphs-memory-and-human-in-the-loop/12_lg-11.py` |
| Testing graphs with fake models | `05-testing-tracing-and-operating/01_prod-0.py` |
| Tracing and observability | `05-testing-tracing-and-operating/02_prod-1.py` |
| Deploying and operating graph agents | `05-testing-tracing-and-operating/03_prod-2.py` |
| Choosing: raw loop, LangChain agent or LangGraph | `05-testing-tracing-and-operating/04_prod-3.py` |
