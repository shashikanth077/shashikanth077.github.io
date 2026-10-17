# agentic-ai — Python examples

One small, commented script per concept. Run any file with `python <file>`.

| Concept | File |
|---|---|
| What an AI agent is | `01-what-agents-are/01_core-0.py` |
| Workflows versus agents | `01-what-agents-are/02_core-1.py` |
| Levels of autonomy | `01-what-agents-are/03_core-2.py` |
| Parts of an agent | `01-what-agents-are/04_core-3.py` |
| Why errors compound over many steps | `01-what-agents-are/05_core-4.py` |
| The cost of looping: tokens grow every step | `01-what-agents-are/06_core-5.py` |
| Tool calling: the model asks, your code acts | `02-tools-and-the-model-context-protocol/01_tools-0.py` |
| Designing tools the model can use | `02-tools-and-the-model-context-protocol/02_tools-1.py` |
| Validate arguments, return errors as observations | `02-tools-and-the-model-context-protocol/03_tools-2.py` |
| Retries, timeouts and back-off | `02-tools-and-the-model-context-protocol/04_tools-3.py` |
| Parallel tool calls and dependencies | `02-tools-and-the-model-context-protocol/05_tools-4.py` |
| Code execution as a tool | `02-tools-and-the-model-context-protocol/06_tools-5.py` |
| Model Context Protocol (MCP) | `02-tools-and-the-model-context-protocol/07_tools-6.py` |
| Choosing among many tools | `02-tools-and-the-model-context-protocol/08_tools-7.py` |
| Side effects and idempotency | `02-tools-and-the-model-context-protocol/09_tools-8.py` |
| ReAct: reason, act, observe | `03-planning-reasoning-and-search/01_plan-0.py` |
| Plan first, then execute | `03-planning-reasoning-and-search/02_plan-1.py` |
| Decomposition: tasks as a dependency graph | `03-planning-reasoning-and-search/03_plan-2.py` |
| Reflection: critique and revise | `03-planning-reasoning-and-search/04_plan-3.py` |
| Searching over attempts: best-of-n and voting | `03-planning-reasoning-and-search/05_plan-4.py` |
| Stopping rules and budgets | `03-planning-reasoning-and-search/06_plan-5.py` |
| Short-term memory: managing the context window | `04-memory-and-state/01_mem-0.py` |
| Long-term memory: store, retrieve, score | `04-memory-and-state/02_mem-1.py` |
| State and scratchpads | `04-memory-and-state/03_mem-2.py` |
| What should an agent remember? | `04-memory-and-state/04_mem-3.py` |
| Memory risks: staleness, poisoning, privacy | `04-memory-and-state/05_mem-4.py` |
| Multi-agent patterns | `05-multi-agent-systems/01_multi-0.py` |
| Handoffs and communication | `05-multi-agent-systems/02_multi-1.py` |
| Parallel agents and the speed-up limit | `05-multi-agent-systems/03_multi-2.py` |
| The token cost of multi-agent systems | `05-multi-agent-systems/04_multi-3.py` |
| Consensus and conflict between agents | `05-multi-agent-systems/05_multi-4.py` |
| Measuring agents: task success first | `06-evaluating-agents/01_evalu-0.py` |
| Reliability: pass^k, not just pass@k | `06-evaluating-agents/02_evalu-1.py` |
| Evaluating the trajectory, not only the outcome | `06-evaluating-agents/03_evalu-2.py` |
| Cost, latency and the value of a solved task | `06-evaluating-agents/04_evalu-3.py` |
| Benchmarks and sandboxes for agents | `06-evaluating-agents/05_evalu-4.py` |
| Observability: traces, logs and monitoring | `06-evaluating-agents/06_evalu-5.py` |
| Why agent safety is different | `07-safety-security-and-control/01_safe-0.py` |
| Least privilege and permissions | `07-safety-security-and-control/02_safe-1.py` |
| Human approval: when to ask | `07-safety-security-and-control/03_safe-2.py` |
| Indirect prompt injection through tool results | `07-safety-security-and-control/04_safe-3.py` |
| Irreversible actions, sandboxes and dry runs | `07-safety-security-and-control/05_safe-4.py` |
| Circuit breakers, rate limits and budgets | `07-safety-security-and-control/06_safe-5.py` |
| Audit, accountability and red-teaming | `07-safety-security-and-control/07_safe-6.py` |
| A minimal agent from scratch | `08-building-and-shipping-agents/01_build-0.py` |
| Agents as state machines and graphs | `08-building-and-shipping-agents/02_build-1.py` |
| Checkpoints and durable execution | `08-building-and-shipping-agents/03_build-2.py` |
| Computer-use and browser agents | `08-building-and-shipping-agents/04_build-3.py` |
| Coding agents: a worked design | `08-building-and-shipping-agents/05_build-4.py` |
| Choosing and shipping: a decision guide | `08-building-and-shipping-agents/06_build-5.py` |
