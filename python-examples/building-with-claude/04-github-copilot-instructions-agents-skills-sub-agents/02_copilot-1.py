# -*- coding: utf-8 -*-
# ==========================================================================
# Custom instructions: always-on guidance [building-with-claude / GitHub
# Copilot: instructions, agents, skills, sub-agents]
# ==========================================================================
# WHAT IT IS
# The simplest customisation is a Markdown file of instructions.
# .github/copilot-instructions.md at the repository root applies to every
# Copilot request in that repository (a personal version lives at
# ~/.copilot/copilot-instructions.md). Path-specific files go in
# .github/instructions/ with the suffix .instructions.md and an applyTo glob
# in the frontmatter, for example applyTo: '/.py' for Python files only —
# optional name and description fields support on-demand discovery. The
# cross-agent AGENTS.md at the repository root is also read by Copilot and by
# other coding agents. Write short, concrete rules ("use pytest; never edit
# generated files"), keep them current and avoid contradicting yourself.
#
# WHERE YOU USE IT
# Instructions are always spent as context: move rarely needed material into
# skills or path-specific files.
#
# RUN IT:  python 02_copilot-1.py
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
import fnmatch

instr = """---
description: Python conventions
applyTo: '**/*.py'
---
Use type hints. Run pytest before suggesting a commit.
"""
meta, body = parse_frontmatter(instr)
pattern = meta["applyTo"].strip("'")
files = ["src/app/main.py", "src/app/main.ts", "tests/test_api.py"]
print(pattern, [f for f in files if fnmatch.fnmatch(f, pattern)])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# **/*.py ['src/app/main.py', 'tests/test_api.py']
