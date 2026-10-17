# -*- coding: utf-8 -*-
# ==========================================================================
# Plugins, packaging and team rollout [building-with-claude / Claude Code:
# skills, subagents, hooks]
# ==========================================================================
# WHAT IT IS
# To share a setup, package it as a plugin: a bundle of skills, subagents,
# hooks, commands and MCP servers that others install, with plugin skills
# namespaced as /plugin-name:skill-name. Commit project-level files
# (.claude/skills, .claude/agents, CLAUDE.md, .mcp.json, shared settings) so
# every developer and CI job gets the same behaviour; keep personal
# preferences in CLAUDE.local.md and user settings. For an organisation,
# managed settings enforce policy (allowed tools, MCP servers, instructions).
# Roll out in stages: a pilot team, written guidelines for what to delegate
# and what to review, a shared prompt and skill library, tracked metrics
# (cycle time, review findings, defects) and an incident path for
# misbehaviour.
#
# WHERE YOU USE IT
# Version your skills and agents like code: review changes, test them on a
# fixed set of tasks and document the owner.
#
# RUN IT:  python 09_cc-8.py
#

project_files = [".claude/skills/", ".claude/agents/", "CLAUDE.md", ".mcp.json", ".claude/settings.json"]
personal = ["CLAUDE.local.md", "~/.claude/CLAUDE.md", "~/.claude/settings.json", "~/.claude/skills/"]
print("committed:", project_files)
print("personal :", personal)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# committed: ['.claude/skills/', '.claude/agents/', 'CLAUDE.md', '.mcp.json', '.claude/settings.json']
# personal : ['CLAUDE.local.md', '~/.claude/CLAUDE.md', '~/.claude/settings.json', '~/.claude/skills/']
