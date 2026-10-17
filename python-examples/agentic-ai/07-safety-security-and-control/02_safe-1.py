# -*- coding: utf-8 -*-
# ==========================================================================
# Least privilege and permissions [agentic-ai / Safety, security and control]
# ==========================================================================
# WHAT IT IS
# Give an agent the minimum access the task needs and nothing more. Separate
# read from write credentials; scope tokens to one repository, one folder or
# one customer; use short-lived credentials; keep secrets out of the model's
# context (inject them in the tool, not in the prompt); and deny by default
# with an explicit allow-list of tools and domains. If the agent only ever
# needs to read orders for one customer, a database role with SELECT on one
# view limits the damage of any mistake or injection to leaking that
# customer's rows. Review permissions the way you review code: every new tool
# is a new capability for attackers.
#
# WHERE YOU USE IT
# The most effective safety control is often removing a tool the agent did not
# need.
#
# RUN IT:  python 02_safe-1.py
#

allowed_tools = {"search_orders", "get_order"}
requested = ["search_orders", "delete_order", "get_order"]
print([t for t in requested if t in allowed_tools], "allowed;", [t for t in requested if t not in allowed_tools], "denied")
credentials = {"db": "role=reader, scope=orders_view, ttl=15min"}
print(credentials["db"])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ['search_orders', 'get_order'] allowed; ['delete_order'] denied
# role=reader, scope=orders_view, ttl=15min
