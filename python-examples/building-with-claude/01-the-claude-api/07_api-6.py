# -*- coding: utf-8 -*-
# ==========================================================================
# Controlling tools: tool_choice, parallel calls, strict schemas
# [building-with-claude / The Claude API]
# ==========================================================================
# WHAT IT IS
# tool_choice steers tool use: {"type": "auto"} (default — Claude decides),
# "any" (must use some tool), "tool" with a name (must use that one) or none.
# With {"type": "auto", "disable_parallel_tool_use": true} Claude makes at
# most one call per turn; otherwise it may return several tool_use blocks at
# once — run independent ones concurrently and return all results in one user
# message, each with its own tool_use_id. Add strict: true to a tool
# definition to guarantee the call matches your schema. Each request that
# includes tools also carries a small automatic tool-use system prompt (about
# 286 tokens on the current Opus 5.5, Sonnet 5.5 and Haiku 5.5 models), plus
# the tokens of your tool descriptions.
#
# WHERE YOU USE IT
# Few, well-described tools beat many overlapping ones; the tool list is input
# you pay for on every call.
#
# RUN IT:  python 07_api-6.py
#

choice_auto = {"type": "auto"}
choice_single = {"type": "auto", "disable_parallel_tool_use": True}
choice_force = {"type": "tool", "name": "get_weather"}
print(choice_auto, choice_single, choice_force, sep="\n")
calls = [{"id": "t1", "name": "get_weather"}, {"id": "t2", "name": "get_time"}]
results = [{"type": "tool_result", "tool_use_id": c["id"], "content": "ok"} for c in calls]
print([r["tool_use_id"] for r in results])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# {'type': 'auto'}
# {'type': 'auto', 'disable_parallel_tool_use': True}
# {'type': 'tool', 'name': 'get_weather'}
# ['t1', 't2']
