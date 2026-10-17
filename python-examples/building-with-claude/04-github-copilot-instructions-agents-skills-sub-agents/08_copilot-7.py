# -*- coding: utf-8 -*-
# ==========================================================================
# Designing a sub-agent team [building-with-claude / GitHub Copilot:
# instructions, agents, skills, sub-agents]
# ==========================================================================
# WHAT IT IS
# A concrete design for "implement a feature". Orchestrator (tools: agent,
# read; agents: researcher, implementer, tester): splits the task, writes a
# brief for each subagent, merges results, never edits code itself. Researcher
# (read, search; user-invocable: false): maps the relevant files and returns a
# 20-line summary. Implementer (read, edit): makes the change described in the
# brief. Tester (read, terminal): runs the test suite and reports failures.
# The files live in .github/agents/. Benefits: each context stays small (the
# researcher may read 50,000 tokens but returns 500), tools are minimal per
# role, and the orchestrator's context only grows by the summaries. Costs:
# more model calls, and a poor brief produces poor work — test the team on
# past tasks before relying on it.
#
# WHERE YOU USE IT
# Add subagents only where a context or tool boundary helps; for small tasks a
# single agent is faster and cheaper.
#
# RUN IT:  python 08_copilot-7.py
#

files = {
    ".github/agents/orchestrator.agent.md": "tools: [agent, read]; agents: [researcher, implementer, tester]",
    ".github/agents/researcher.agent.md": "tools: [read, search]; user-invocable: false",
    ".github/agents/implementer.agent.md": "tools: [read, edit]; user-invocable: false",
    ".github/agents/tester.agent.md": "tools: [read, terminal]; user-invocable: false",
}
for path, summary in files.items():
    print(f"{path:40s} {summary}")
read, returned = 50000, 500
print("main context grows by", returned, "instead of", read, "->", read // returned, "x smaller")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# .github/agents/orchestrator.agent.md     tools: [agent, read]; agents: [researcher, implementer, tester]
# .github/agents/researcher.agent.md       tools: [read, search]; user-invocable: false
# .github/agents/implementer.agent.md      tools: [read, edit]; user-invocable: false
# .github/agents/tester.agent.md           tools: [read, terminal]; user-invocable: false
# main context grows by 500 instead of 50000 -> 100 x smaller
