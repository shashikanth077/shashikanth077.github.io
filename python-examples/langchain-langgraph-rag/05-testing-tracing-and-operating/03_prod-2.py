# -*- coding: utf-8 -*-
# ==========================================================================
# Deploying and operating graph agents [langchain-langgraph-rag / Testing,
# tracing and operating]
# ==========================================================================
# WHAT IT IS
# Operating long-running agents adds concerns beyond a script. Durability: use
# a database-backed checkpointer so a restart resumes runs. Idempotency:
# resumed nodes restart from their beginning, so side effects must tolerate
# repeats (idempotency keys). Concurrency: one thread id per conversation;
# avoid two simultaneous runs on the same thread. Timeouts, retries and
# budgets: per tool and per run, with a recursion limit and token budget.
# Versioning: a checkpoint written by one graph version may not match a
# changed state schema — plan migrations or finish old runs first. Security:
# tools run with your permissions; sandbox code execution, scope credentials,
# keep untrusted text out of instructions. Cost: monitor tokens per task and
# alert on spikes. Roll out gradually and keep a human fallback.
#
# WHERE YOU USE IT
# Test the crash path on purpose: kill the process mid-run and confirm it
# resumes without repeating effects.
#
# RUN IT:  python 03_prod-2.py
#

old_checkpoint = {"state": {"messages": ["hi"], "retries": 1}}
new_schema_keys = {"messages", "retries", "approved"}
missing = new_schema_keys - set(old_checkpoint["state"])
print("keys missing in old checkpoints:", sorted(missing))
runs = [("r1", "paused for approval 3 days"), ("r2", "crashed at step 7")]
print([r for r, _ in runs], "must resume with the schema that wrote them")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# keys missing in old checkpoints: ['approved']
# ['r1', 'r2'] must resume with the schema that wrote them
