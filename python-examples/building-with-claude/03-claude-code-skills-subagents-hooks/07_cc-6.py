# -*- coding: utf-8 -*-
# ==========================================================================
# Permissions, settings and MCP in Claude Code [building-with-claude / Claude
# Code: skills, subagents, hooks]
# ==========================================================================
# WHAT IT IS
# Control what Claude may do without asking. Permission rules in settings
# allow or deny tools and commands (allow Bash(npm test), deny reads of .env
# files); permission modes range from asking for each action to plan-only and
# auto-accept edits; settings files exist at managed, user, project and local
# levels with the narrower scope overriding where allowed. MCP servers add
# tools: configure them per user or project (committed .mcp.json for a team)
# and scope each to the minimum. Third-party servers run with your permissions
# and their text enters the model's context, so review them like dependencies.
# In headless or CI use, grant only the tools the job needs and run in a
# sandbox or container without production credentials.
#
# WHERE YOU USE IT
# Start restrictive and add allow rules for commands you approve repeatedly;
# never blanket-allow shell access on a machine with secrets.
#
# RUN IT:  python 07_cc-6.py
#

allow = ["Bash(npm test)", "Bash(git status)", "Read(src/**)"]
deny = ["Read(.env)", "Bash(rm -rf *)"]
def decide(action):
    if action in deny:
        return "deny"
    return "allow" if action in allow else "ask"

for a in ["Bash(npm test)", "Read(.env)", "Bash(curl http://x)"]:
    print(f"{a:22s} -> {decide(a)}")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# Bash(npm test)         -> allow
# Read(.env)             -> deny
# Bash(curl http://x)    -> ask
