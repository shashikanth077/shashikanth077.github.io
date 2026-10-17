# -*- coding: utf-8 -*-
# ==========================================================================
# Subagents that spawn subagents, and parallel work [building-with-claude /
# Claude Code: skills, subagents, hooks]
# ==========================================================================
# WHAT IT IS
# Subagents can themselves delegate: by default they nest up to three layers
# below the main conversation (CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH changes
# it), and up to 20 subagents can run concurrently
# (CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS). To stop a particular subagent from
# spawning more, leave the Agent tool out of its tools list or add it to
# disallowedTools. Parallel subagents suit independent investigations:
# security review, test coverage and documentation checks of the same change
# run side by side, and the lead merges the findings. Remember the costs: each
# subagent has its own context and token bill — four parallel agents reading
# the same 10,000-token background use 40,000 input tokens — and results
# arrive as summaries, so the brief you give each one must carry its goal,
# context and expected output.
#
# WHERE YOU USE IT
# Parallelise independent, expensive investigations; keep short, dependent
# steps in the main conversation.
#
# RUN IT:  python 04_cc-3.py
#

depth_limit, concurrent_limit = 3, 20
print("nesting depth:", depth_limit, "| concurrent subagents:", concurrent_limit)
agents = 4
background = 10000
print(agents * background, "input tokens when", agents, "agents each read", background)
reviewer = {"name": "reviewer", "tools": ["Read", "Grep"], "disallowedTools": ["Agent"]}
print("can spawn others:", "Agent" in reviewer["tools"] and "Agent" not in reviewer["disallowedTools"])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# nesting depth: 3 | concurrent subagents: 20
# 40000 input tokens when 4 agents each read 10000
# can spawn others: False
