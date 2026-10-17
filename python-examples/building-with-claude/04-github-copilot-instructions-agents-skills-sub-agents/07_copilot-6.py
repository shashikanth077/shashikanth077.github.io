# -*- coding: utf-8 -*-
# ==========================================================================
# Sub-agents in Copilot [building-with-claude / GitHub Copilot: instructions,
# agents, skills, sub-agents]
# ==========================================================================
# WHAT IT IS
# A subagent is an agent the main agent calls for a focused piece of work. In
# VS Code the main agent delegates through the agent tool (shown as Run
# Subagent): you can ask in natural language ("use a subagent to research the
# auth flow") or let the agent delegate on its own. The subagent works in its
# own context and returns a focused result, so intermediate research stays out
# of the main conversation. It does not inherit the main chat history — the
# task must state the goal, context, allowed actions and expected result — and
# each invocation is stateless: follow-ups need a new invocation. A
# coordinator lists permitted subagents in its agents property ( for all, []
# for none) and must include the agent tool in tools. To keep an agent usable
# only as a subagent, set user-invocable: false; to forbid other agents from
# calling it, set disable-model-invocation: true.
#
# WHERE YOU USE IT
# Write the delegation brief as if for a colleague who has seen nothing: goal,
# context, constraints, output format.
#
# RUN IT:  python 07_copilot-6.py
#

agents = {
    "orchestrator": {"agents": ["researcher", "implementer", "tester"], "tools": ["agent", "read"]},
    "researcher": {"user-invocable": False, "tools": ["read", "search"]},
    "implementer": {"user-invocable": False, "tools": ["read", "edit"]},
    "tester": {"user-invocable": False, "tools": ["read", "terminal"], "disable-model-invocation": True},
}
def can_delegate(lead, target):
    a = agents[lead]
    allowed = a.get("agents", [])
    return "agent" in a.get("tools", []) and (allowed == ["*"] or target in allowed) and not agents[target].get("disable-model-invocation", False)

for t in ["researcher", "tester"]:
    print(t, "in picker:", agents[t].get("user-invocable", True), "| orchestrator may call:", can_delegate("orchestrator", t))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# researcher in picker: False | orchestrator may call: True
# tester in picker: False | orchestrator may call: False
