# -*- coding: utf-8 -*-
# ==========================================================================
# CLAUDE.md: persistent project instructions [building-with-claude / Claude
# Code: skills, subagents, hooks]
# ==========================================================================
# WHAT IT IS
# Every Claude Code session starts with a fresh context; CLAUDE.md carries
# what you would otherwise re-explain. Locations (broadest to most specific):
# managed policy (organisation-wide), ~/.claude/CLAUDE.md (your preferences
# for all projects), ./CLAUDE.md or ./.claude/CLAUDE.md (team-shared,
# committed), and ./CLAUDE.local.md (personal, gitignored). Files above the
# working directory load at launch; those in subdirectories load on demand.
# Use @path/to/file to import other files. Run /init to generate a starting
# file. Keep each file under about 200 lines and write concrete, verifiable
# instructions ("run npm test before committing"), because Claude treats
# CLAUDE.md as context, not enforced configuration — enforcement belongs in
# hooks and permissions.
#
# WHERE YOU USE IT
# If two instructions contradict each other Claude may pick either: review
# CLAUDE.md files regularly for conflicts and stale advice.
#
# RUN IT:  python 01_cc-0.py
#

locations = [
    ("managed policy", "organisation-wide", True),
    ("~/.claude/CLAUDE.md", "you, all projects", False),
    ("./CLAUDE.md", "team, committed", True),
    ("./CLAUDE.local.md", "you, this project (gitignored)", False),
]
for path, scope, shared in locations:
    print(f"{path:22s} {scope:34s} shared={shared}")
claude_md = ["# Build", "- Run npm test before committing", "- Node 22", "@docs/architecture.md"]
print(len(claude_md), "lines; imports:", [l for l in claude_md if l.startswith("@")])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# managed policy         organisation-wide                  shared=True
# ~/.claude/CLAUDE.md    you, all projects                  shared=False
# ./CLAUDE.md            team, committed                    shared=True
# ./CLAUDE.local.md      you, this project (gitignored)     shared=False
# 4 lines; imports: ['@docs/architecture.md']
