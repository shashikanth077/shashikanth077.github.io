# -*- coding: utf-8 -*-
# ==========================================================================
# Custom agents: .agent.md [building-with-claude / GitHub Copilot:
# instructions, agents, skills, sub-agents]
# ==========================================================================
# WHAT IT IS
# A custom agent is a persona with its own instructions, tool set and model.
# Repository agents live in .github/agents/ as <name>.agent.md (letters,
# digits, ., - and _ in the file name); organisation or enterprise agents sit
# in an agents/ directory at the root of the .github or .github-private
# repository. The YAML frontmatter has: description (required on GitHub; what
# the agent does), name (defaults to the file name), tools (aliases such as
# read, edit, search; omitted means all tools), model (IDE environments),
# target (vscode or github-copilot), mcp-servers (agent-specific MCP
# configuration) and, in VS Code, argument-hint, handoffs, agents,
# user-invocable, disable-model-invocation and hooks. The Markdown body is the
# agent's prompt, up to 30,000 characters.
#
# WHERE YOU USE IT
# Restrict tools to the minimum: a reviewer that cannot edit files cannot
# damage them.
#
# RUN IT:  python 04_copilot-3.py
#

import re

def parse_frontmatter(text):
    m = re.match(r"---\n(.*?)\n---\n(.*)", text, re.S)
    if not m:
        return {}, text
    meta = {}
    for line in m.group(1).splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            meta[k.strip()] = v.strip()
    return meta, m.group(2)
import re

agent = """---
name: Reviewer
description: Reviews pull requests for correctness and security; never edits files.
tools: ['read', 'search']
---
You are a careful reviewer. List findings with file and line, most serious first.
"""
meta, body = parse_frontmatter(agent)
filename_ok = re.fullmatch(r"[A-Za-z0-9._-]+\.agent\.md", "reviewer.agent.md") is not None
print(sorted(meta), "description present:", "description" in meta, "file name ok:", filename_ok)
print(len(body), "characters of prompt (limit 30,000)")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ['description', 'name', 'tools'] description present: True file name ok: True
# 82 characters of prompt (limit 30,000)
