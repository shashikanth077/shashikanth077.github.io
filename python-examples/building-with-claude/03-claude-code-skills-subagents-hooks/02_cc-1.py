# -*- coding: utf-8 -*-
# ==========================================================================
# Skills: reusable know-how loaded on demand [building-with-claude / Claude
# Code: skills, subagents, hooks]
# ==========================================================================
# WHAT IT IS
# A skill is a folder with a SKILL.md file — YAML frontmatter plus Markdown
# instructions — and optional scripts and reference files. Locations:
# ~/.claude/skills/<name>/SKILL.md (all your projects),
# .claude/skills/<name>/SKILL.md (this repository, committed), plugins, and
# managed enterprise settings. The frontmatter fields are optional, but
# description matters most: Claude reads it to decide when to load the skill.
# Other fields include name (defaults to the directory),
# disable-model-invocation (only you can invoke it, as /name), user-invocable:
# false (only Claude can), allowed-tools, model, context: fork (run in a
# subagent) and paths (activate for matching files). Skills use progressive
# disclosure: the descriptions are always in context, the SKILL.md body loads
# when used, and supporting files only when SKILL.md points to them — so many
# skills cost little context.
#
# WHERE YOU USE IT
# Keep SKILL.md under about 500 lines and push detail into referenced files;
# write the description as "when to use this".
#
# RUN IT:  python 02_cc-1.py
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
skill = """---
name: release-notes
description: Draft release notes from merged pull requests. Use when asked to prepare a release.
disable-model-invocation: false
---
1. List merged PRs since the last tag.
2. Group by label.
3. Write the notes in docs/RELEASE.md.
"""
meta, body = parse_frontmatter(skill)
print(sorted(meta))
print(len(body.splitlines()), "instruction lines")
print("always in context: ~", 20 * 100, "tokens for 20 descriptions; bodies load only when used")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ['description', 'disable-model-invocation', 'name']
# 3 instruction lines
# always in context: ~ 2000 tokens for 20 descriptions; bodies load only when used
