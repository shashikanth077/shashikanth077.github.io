# -*- coding: utf-8 -*-
# ==========================================================================
# Choosing between prompt, tool runner, SDK and platform [building-with-claude
# / SDKs and platforms]
# ==========================================================================
# WHAT IT IS
# A decision ladder for the API user. One-shot generation or classification: a
# single Messages call (batch it if offline). A model that must call your
# functions: tool use with the loop in your code, or the SDK's tool runner
# that executes tools and returns results for you. A coding or file-editing
# agent: the Agent SDK or Claude Code. Long-running work you do not want to
# host: Managed Agents. External systems through a standard interface: MCP (a
# connector in the API, or servers in Claude Code and the Agent SDK). Whatever
# you pick, define the evaluation set first, track cost per task, and keep
# human approval for irreversible actions.
#
# WHERE YOU USE IT
# Climb one rung at a time and measure; most products need fewer layers than
# the first design suggests.
#
# RUN IT:  python 03_sdk-2.py
#

needs = {
    "nightly document classifier": "Messages API via the Batch API",
    "chat assistant that checks order status": "Messages API with tool use (your tools)",
    "code-fixing agent in our CI": "Agent SDK or Claude Code in a sandbox",
    "agent we do not want to host": "Managed Agents",
}
for k, v in needs.items():
    print(f"{k:42s} -> {v}")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# nightly document classifier                -> Messages API via the Batch API
# chat assistant that checks order status    -> Messages API with tool use (your tools)
# code-fixing agent in our CI                -> Agent SDK or Claude Code in a sandbox
# agent we do not want to host               -> Managed Agents
