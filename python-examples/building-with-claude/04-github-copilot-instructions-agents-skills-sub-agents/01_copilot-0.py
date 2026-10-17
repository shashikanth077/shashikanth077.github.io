# -*- coding: utf-8 -*-
# ==========================================================================
# The Copilot customisation map [building-with-claude / GitHub Copilot:
# instructions, agents, skills, sub-agents]
# ==========================================================================
# WHAT IT IS
# GitHub Copilot can be shaped at five levels, from always-on rules to
# specialist teammates. Custom instructions: guidance applied to every request
# (or to matching files). Prompt files: saved, reusable prompts you run with a
# slash command. Custom agents: named personas with their own instructions,
# tools and model, selectable or delegable. Agent Skills: folders of
# instructions, scripts and resources loaded only when relevant. MCP servers:
# external tools and data. Choose by how the knowledge should be applied:
# always (instructions), on request (prompt files), as a role (agents), on
# demand by relevance (skills), or as a capability (MCP). A small, well-chosen
# set beats a large pile.
#
# WHERE YOU USE IT
# Start with one instructions file; add prompt files for repeated tasks; add
# agents and skills when a role or procedure needs its own context and tools.
#
# RUN IT:  python 01_copilot-0.py
#

fit = {
    "team coding standards": ".github/copilot-instructions.md (always applied)",
    "repeatable 'write an API endpoint' task": ".github/prompts/create-api.prompt.md (run with /create-api)",
    "read-only reviewer role": ".github/agents/reviewer.agent.md (restricted tools)",
    "multi-step release procedure": ".github/skills/release/SKILL.md (loaded on demand)",
    "access to the issue tracker": "an MCP server",
}
for need, where in fit.items():
    print(f"{need:42s} -> {where}")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# team coding standards                      -> .github/copilot-instructions.md (always applied)
# repeatable 'write an API endpoint' task    -> .github/prompts/create-api.prompt.md (run with /create-api)
# read-only reviewer role                    -> .github/agents/reviewer.agent.md (restricted tools)
# multi-step release procedure               -> .github/skills/release/SKILL.md (loaded on demand)
# access to the issue tracker                -> an MCP server
