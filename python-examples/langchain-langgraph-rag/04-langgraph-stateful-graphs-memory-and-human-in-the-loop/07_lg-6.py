# -*- coding: utf-8 -*-
# ==========================================================================
# Send: dynamic fan-out and orchestrator–worker [langchain-langgraph-rag /
# LangGraph: stateful graphs, memory and human-in-the-loop]
# ==========================================================================
# WHAT IT IS
# Sometimes the number of parallel branches is known only at run time — an
# orchestrator splits a report into however many sections the topic needs.
# LangGraph's Send API handles this: a routing function returns a list of
# Send(node, state) objects, one per sub-task, each with its own input state;
# the workers run in parallel and their outputs are merged into the shared
# state by a reducer (typically a list that accumulates results); a final node
# synthesises them. This is the orchestrator–worker pattern from the agentic
# track as a graph: orchestrator (plan) → workers (Send, parallel) →
# synthesizer. Remember the costs: each worker has its own model call and
# context, so a plan of 10 sections means at least 10 calls.
#
# WHERE YOU USE IT
# Give workers a compact brief, not the whole state; and cap the number of
# workers the orchestrator may create.
#
# RUN IT:  python 07_lg-6.py
#

def orchestrator(topic):
    return [f"{topic}: background", f"{topic}: risks", f"{topic}: costs"]

def worker(subtask):
    return f"notes on '{subtask}'"

class Send:
    def __init__(self, node, state):
        self.node, self.state = node, state

plan = orchestrator("vector databases")
sends = [Send("worker", {"subtask": s}) for s in plan]
results = [worker(s.state["subtask"]) for s in sends]
print(len(sends), "workers")
print(results)
print("synthesised:", " | ".join(r.split("'")[1] for r in results))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 3 workers
# ["notes on 'vector databases: background'", "notes on 'vector databases: risks'", "notes on 'vector databases: costs'"]
# synthesised: vector databases: background | vector databases: risks | vector databases: costs
