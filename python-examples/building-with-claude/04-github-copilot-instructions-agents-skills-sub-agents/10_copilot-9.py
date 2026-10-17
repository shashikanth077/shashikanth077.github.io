# -*- coding: utf-8 -*-
# ==========================================================================
# Skills, agents, instructions or prompt files? [building-with-claude / GitHub
# Copilot: instructions, agents, skills, sub-agents]
# ==========================================================================
# WHAT IT IS
# A decision guide. Custom instructions: standards that should always hold
# ("use TypeScript strict mode") — cheap, but always in context. Prompt files:
# a task you trigger yourself and parameterise. Agent Skills: a procedure with
# scripts or reference material that should load only when relevant, and that
# also works across tools that read the SKILL.md format. Custom agents: a role
# with its own tools, model and persona, selectable in the UI or delegated to
# as a subagent. MCP: access to a system. Combine them: an agent can be
# restricted to read tools, follow the repository's instructions and load a
# skill for a procedure. Keep the number of always-on tokens small and the
# number of agent tools smaller still.
#
# WHERE YOU USE IT
# If a rule must hold every time, consider an enforcement mechanism (CI
# checks, branch protection, hooks) in addition to asking nicely.
#
# RUN IT:  python 10_copilot-9.py
#

descriptions, bodies, n = 100, 2000, 20
print("20 skills: always loaded", n * descriptions, "tokens of descriptions; all bodies would be", n * bodies)
print("20 instruction files of 2,000 tokens always applied:", n * bodies)
choice = {"always-true standard": "instructions", "occasional procedure with a script": "skill", "role with tools": "agent", "task you trigger": "prompt file"}
print(choice)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 20 skills: always loaded 2000 tokens of descriptions; all bodies would be 40000
# 20 instruction files of 2,000 tokens always applied: 40000
# {'always-true standard': 'instructions', 'occasional procedure with a script': 'skill', 'role with tools': 'agent', 'task you trigger': 'prompt file'}
