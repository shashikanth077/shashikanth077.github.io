# -*- coding: utf-8 -*-
# ==========================================================================
# Prompt files: reusable slash commands [building-with-claude / GitHub
# Copilot: instructions, agents, skills, sub-agents]
# ==========================================================================
# WHAT IT IS
# A prompt file saves a prompt you run repeatedly. Put it in .github/prompts/
# with the suffix .prompt.md. Optional frontmatter: name (what you type after
# /), description, argument-hint, agent (ask, agent, plan or the name of a
# custom agent), model and tools. In the body,
# ${input:variableName:placeholder} asks the user for a value, ${selection}
# inserts the current selection, #file: references a file and Markdown links
# include workspace files. Run it by typing /name (optionally with extra text)
# in chat, with the Chat: Run Prompt command or with the play button in the
# editor. Prompt files are supported in local VS Code chat sessions. They turn
# "the prompt I paste every time" into a shared, reviewable team asset.
#
# WHERE YOU USE IT
# Keep prompt files short and parameterised; put the lasting rules in
# instructions, not in every prompt.
#
# RUN IT:  python 03_copilot-2.py
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

pf = """---
name: create-api
description: Scaffold a REST endpoint
agent: agent
tools: ['edit', 'search']
---
Create a REST endpoint for ${input:resource:customers} following the project conventions.
"""
meta, body = parse_frontmatter(pf)
filled = re.sub(r"\$\{input:(\w+)(?::[^}]*)?\}", lambda m: {"resource": "orders"}[m.group(1)], body)
print(meta["name"], "->", "/" + meta["name"])
print(filled.strip())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# create-api -> /create-api
# Create a REST endpoint for orders following the project conventions.
