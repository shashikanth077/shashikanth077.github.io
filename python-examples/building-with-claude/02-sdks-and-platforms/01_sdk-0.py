# -*- coding: utf-8 -*-
# ==========================================================================
# Four ways to build: client SDK, Agent SDK, Claude Code, Managed Agents
# [building-with-claude / SDKs and platforms]
# ==========================================================================
# WHAT IT IS
# Anthropic offers several layers; pick by who runs the agent loop. The Client
# SDK calls the Messages API directly: you write (or let the SDK's tool runner
# drive) the loop — maximum control. The Agent SDK (Python and TypeScript)
# embeds the Claude Code agent as a library in a process you operate, with
# built-in tools, permissions, sessions, hooks, subagents and MCP. The Claude
# Code CLI is the terminal tool for interactive development and one-off tasks.
# Managed Agents is a hosted agent harness: Anthropic runs the loop in a
# managed (or self-hosted) sandbox, which you configure through the API. Start
# at the highest layer that gives the control you need.
#
# WHERE YOU USE IT
# More control means more code to build and maintain: do not rebuild the agent
# loop, permissions and context management unless you need to.
#
# RUN IT:  python 01_sdk-0.py
#

layers = {
    "Client SDK": ("you write the tool loop", "full control"),
    "Agent SDK": ("Claude Code's agent as a library", "tools, hooks, subagents built in"),
    "Claude Code CLI": ("terminal tool", "interactive development"),
    "Managed Agents": ("Anthropic hosts the loop and sandbox", "least code to run"),
}
for name, (what, gives) in layers.items():
    print(f"{name:16s} {what:38s} {gives}")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# Client SDK       you write the tool loop                full control
# Agent SDK        Claude Code's agent as a library       tools, hooks, subagents built in
# Claude Code CLI  terminal tool                          interactive development
# Managed Agents   Anthropic hosts the loop and sandbox   least code to run
