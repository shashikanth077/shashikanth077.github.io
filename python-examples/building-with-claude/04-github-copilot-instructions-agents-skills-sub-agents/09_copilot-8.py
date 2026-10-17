# -*- coding: utf-8 -*-
# ==========================================================================
# Agent Skills in Copilot [building-with-claude / GitHub Copilot:
# instructions, agents, skills, sub-agents]
# ==========================================================================
# WHAT IT IS
# Agent Skills are folders of instructions, scripts and resources that Copilot
# loads only when relevant. Project skills live in .github/skills/,
# .claude/skills/ or .agents/skills/; personal skills in ~/.copilot/skills/,
# ~/.claude/skills/ or ~/.agents/skills/ — each skill is a directory
# containing SKILL.md. Frontmatter: name (required: lowercase letters, numbers
# and hyphens, at most 64 characters, and it must match the directory name —
# an invalid name makes the skill silently fail to load), description
# (required, at most 1,024 characters; Copilot uses it to decide when to load
# the skill), plus argument-hint, user-invocable, disable-model-invocation and
# an experimental context: fork. Loading is progressive: discovery (name and
# description), then the SKILL.md body, then referenced files only when needed
# — so you can install many skills without filling the context. Skills teach a
# capability; custom instructions only state standards.
#
# WHERE YOU USE IT
# A skill that never triggers usually has a description that does not say when
# to use it.
#
# RUN IT:  python 09_copilot-8.py
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

def check_skill(dirname, text):
    meta, _ = parse_frontmatter(text)
    problems = []
    name = meta.get("name", "")
    if not re.fullmatch(r"[a-z0-9-]{1,64}", name):
        problems.append("name must be lowercase letters, digits, hyphens, max 64")
    if name != dirname:
        problems.append("name must match the directory name")
    if not 0 < len(meta.get("description", "")) <= 1024:
        problems.append("description required, max 1024 characters")
    return problems or ["ok"]

good = "---\nname: release-notes\ndescription: Draft release notes. Use when preparing a release.\n---\nSteps...\n"
bad = "---\nname: Release_Notes\ndescription: x\n---\n"
print(check_skill("release-notes", good))
print(check_skill("release-notes", bad))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ['ok']
# ['name must be lowercase letters, digits, hyphens, max 64', 'name must match the directory name']
