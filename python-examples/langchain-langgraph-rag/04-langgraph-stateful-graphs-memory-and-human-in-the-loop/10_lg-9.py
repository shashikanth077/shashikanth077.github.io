# -*- coding: utf-8 -*-
# ==========================================================================
# Memory: checkpointer versus store [langchain-langgraph-rag / LangGraph:
# stateful graphs, memory and human-in-the-loop]
# ==========================================================================
# WHAT IT IS
# Two kinds of memory. Short-term memory is the thread's state, persisted by
# the checkpointer: the conversation so far, scoped to one thread_id.
# Long-term memory is persisted by a Store (InMemoryStore in the
# documentation's example; database-backed stores in production):
# application-defined key–value data outside the graph state — user
# preferences, facts, shared knowledge — readable and writable from nodes and
# available across threads. Compile with both:
# builder.compile(checkpointer=checkpointer, store=store). Namespace store
# items (for example by user id) so one user's memory never reaches another's,
# give items a source and a date, and keep subgraph data that must cross graph
# boundaries in the store, because subgraphs have their own checkpoint
# namespace.
#
# WHERE YOU USE IT
# Treat the store like a user database: consent, deletion, expiry and per-user
# isolation.
#
# RUN IT:  python 10_lg-9.py
#

class InMemoryStore:
    def __init__(self):
        self.data = {}
    def put(self, namespace, key, value):
        self.data[(namespace, key)] = value
    def get(self, namespace, key):
        return self.data.get((namespace, key))

store = InMemoryStore()
store.put(("users", "bob"), "preferences", {"units": "metric"})
store.put(("users", "anna"), "preferences", {"units": "imperial"})
print(store.get(("users", "bob"), "preferences"))
print(store.get(("users", "anna"), "preferences"))
print(store.get(("users", "carl"), "preferences"))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# {'units': 'metric'}
# {'units': 'imperial'}
# None
