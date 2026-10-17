# -*- coding: utf-8 -*-
# ==========================================================================
# Model Context Protocol (MCP) [agentic-ai / Tools and the Model Context
# Protocol]
# ==========================================================================
# WHAT IT IS
# Every agent used to need custom glue code for every tool. The Model Context
# Protocol is an open standard that lets an application (the client, such as
# an agent or IDE) talk to servers that expose capabilities in a uniform way,
# over JSON-RPC (local process or HTTP). A server can offer tools (functions
# to call), resources (readable data such as files and database rows) and
# prompts (reusable templates). The client discovers them with tools/list and
# invokes them with tools/call; a new server (GitHub, a database, a calendar)
# works in any compatible client without new code. Treat third-party servers
# like any dependency: they run with your permissions and their text enters
# the model's context.
#
# WHERE YOU USE IT
# Audit the servers you connect, grant the narrowest scopes, and prefer
# confirmation prompts for tools with side effects.
#
# RUN IT:  python 07_tools-6.py
#

import json

request = {"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "get_weather", "arguments": {"city": "Vilnius"}}}
response = {"jsonrpc": "2.0", "id": 1, "result": {"content": [{"type": "text", "text": "4 C, cloudy"}]}}
print(json.dumps(request)[:70] + "...")
print(response["result"]["content"][0]["text"])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# {"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name":...
# 4 C, cloudy
