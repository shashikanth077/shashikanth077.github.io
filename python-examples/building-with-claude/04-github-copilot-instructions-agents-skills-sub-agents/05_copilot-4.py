# -*- coding: utf-8 -*-
# ==========================================================================
# Tools and MCP servers for an agent [building-with-claude / GitHub Copilot:
# instructions, agents, skills, sub-agents]
# ==========================================================================
# WHAT IT IS
# An agent can only act through its tools. The tools list can contain tool
# aliases (read, edit, search), tool sets, extension tools and MCP tools; use
# "server-name/" for all tools of an MCP server or "server-name/tool-1" for
# one. If tools is omitted the agent can use every available tool —
# convenient, but broader than most roles need. MCP servers may come from
# repository settings or from the agent's own mcp-servers property, so a
# specialised agent (for example a database inspector) can have its server
# without exposing it to every agent. Apply the same discipline as for any
# integration: least privilege, read-only credentials where possible, review
# third-party servers, and never put secrets in the agent file.
#
# WHERE YOU USE IT
# Tool lists are the real security boundary of an agent; the instructions are
# only a request.
#
# RUN IT:  python 05_copilot-4.py
#

agents = {
    "reviewer": ["read", "search"],
    "implementer": ["read", "edit", "search", "terminal"],
    "db-inspector": ["read", "db-server/*"],
}
available = {"read", "edit", "search", "terminal", "db-server/query", "db-server/schema"}
def resolve(tools):
    out = set()
    for t in tools:
        if t.endswith("/*"):
            out |= {a for a in available if a.startswith(t[:-1])}
        elif t in available:
            out.add(t)
    return sorted(out)

for name, tools in agents.items():
    print(f"{name:13s} {resolve(tools)}")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# reviewer      ['read', 'search']
# implementer   ['edit', 'read', 'search', 'terminal']
# db-inspector  ['db-server/query', 'db-server/schema', 'read']
