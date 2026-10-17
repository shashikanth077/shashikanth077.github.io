# -*- coding: utf-8 -*-
# ==========================================================================
# The Agent SDK: what you get for free [building-with-claude / SDKs and
# platforms]
# ==========================================================================
# WHAT IT IS
# The Agent SDK exposes the machinery behind Claude Code in Python and
# TypeScript: built-in tools (read, write and edit files, run commands, search
# the web), the agent loop and context management, permissions (which tools
# run automatically and which need approval), hooks (code at lifecycle
# points), subagents for focused sub-tasks, MCP servers for external tools,
# sessions you can resume or fork, and project skills, commands and memory
# loaded from the .claude directories. To drive the same loop from another
# language run the CLI as a subprocess in headless mode (claude -p with
# --output-format json). Authenticate with an API key; third-party products
# may not offer claude.ai login.
#
# WHERE YOU USE IT
# Treat an Agent SDK deployment like any code-running agent: sandbox it, scope
# its permissions and log what it does.
#
# RUN IT:  python 02_sdk-1.py
#

capabilities = ["built-in tools", "permissions", "hooks", "subagents", "MCP servers", "sessions", "skills / commands / memory", "plugins"]
print(len(capabilities), "capabilities:", ", ".join(capabilities))
headless = ["claude", "-p", "Summarise the failing tests", "--output-format", "json"]
print(" ".join(headless))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 8 capabilities: built-in tools, permissions, hooks, subagents, MCP servers, sessions, skills / commands / memory, plugins
# claude -p Summarise the failing tests --output-format json
