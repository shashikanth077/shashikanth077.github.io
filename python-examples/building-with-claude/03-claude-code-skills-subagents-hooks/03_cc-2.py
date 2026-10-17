# -*- coding: utf-8 -*-
# ==========================================================================
# Subagents: delegating with a clean context [building-with-claude / Claude
# Code: skills, subagents, hooks]
# ==========================================================================
# WHAT IT IS
# A subagent is a specialised assistant defined by a Markdown file —
# frontmatter plus a system prompt body — in .claude/agents/ (project),
# ~/.claude/agents/ (all projects), a plugin's agents/ directory or managed
# settings. Only name and description are required; useful fields: tools
# (allow-list) and disallowedTools, model (sonnet, opus, haiku, fable, a full
# model ID or inherit), permissionMode, maxTurns, skills (preload),
# mcpServers, hooks, memory, isolation: worktree and effort. Each subagent
# runs in its own context window with its own system prompt, tools and
# permissions and does not see your conversation: verbose work (reading 50,000
# tokens of files) stays in its window and only a short summary returns to the
# main conversation. Claude delegates automatically by matching the task to
# the description ("use proactively" helps), or you invoke one by name, with
# an @-mention, or for a whole session with claude --agent <name>.
#
# WHERE YOU USE IT
# Give each subagent one clear job and the minimum tools: a read-only reviewer
# cannot accidentally edit code.
#
# RUN IT:  python 03_cc-2.py
#

import re

def parse_frontmatter(text):
    """A tiny parser for the YAML subset used in agent and skill files (key: value lines)."""
    m = re.match(r"---\n(.*?)\n---\n(.*)", text, re.S)
    if not m:
        return None, text
    meta = {}
    for line in m.group(1).splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            meta[k.strip()] = v.strip()
    return meta, m.group(2)
agent = """---
name: code-reviewer
description: Reviews code for quality and security. Use proactively after code changes.
tools: Read, Glob, Grep
model: sonnet
---
You are a code reviewer. Report specific, actionable findings.
"""
meta, body = parse_frontmatter(agent)
required = {"name", "description"}
print(required <= set(meta), meta["tools"], meta["model"])
print("context kept out of the main window:", 50000 - 1000, "tokens")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# True Read, Glob, Grep sonnet
# context kept out of the main window: 49000 tokens
