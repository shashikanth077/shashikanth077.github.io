# -*- coding: utf-8 -*-
# ==========================================================================
# Observability: traces, logs and monitoring [agentic-ai / Evaluating agents]
# ==========================================================================
# WHAT IT IS
# You cannot fix what you cannot see. Record for every run a trace: the task,
# each step with the prompt version, model, tool call and arguments, result
# (truncated), tokens, latency and cost, plus the final outcome. Index traces
# by run id; sample failures and expensive runs for review; keep a dashboard
# of success rate, cost, steps, tool error rate and p95 latency; alert on
# spikes (a loop burning tokens, a tool failing 30% of the time). Mask
# personal data in logs, set retention, and keep the ability to replay a trace
# against a new prompt or model — the best regression test you will ever have.
#
# WHERE YOU USE IT
# Add trace ids from the first prototype: retrofitting observability into a
# running agent is painful.
#
# RUN IT:  python 06_evalu-5.py
#

trace_step = {"run_id": "r-17", "step": 3, "model": "m-1", "prompt_version": "v12", "tool": "search_orders", "args": {"customer_id": "482913"}, "result": "2 orders", "tokens_in": 3400, "tokens_out": 120, "latency_ms": 910, "cost": 0.0112}
print(sorted(trace_step))
print(round(trace_step["tokens_in"] / 1e6 * 3 + trace_step["tokens_out"] / 1e6 * 15, 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ['args', 'cost', 'latency_ms', 'model', 'prompt_version', 'result', 'run_id', 'step', 'tokens_in', 'tokens_out', 'tool']
# 0.012
