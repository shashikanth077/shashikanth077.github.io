# -*- coding: utf-8 -*-
# ==========================================================================
# Designing tools the model can use [agentic-ai / Tools and the Model Context
# Protocol]
# ==========================================================================
# WHAT IT IS
# Tool descriptions are prompts. A good tool has a clear name (verb + object:
# search_orders), a description that says when to use it and when not to,
# typed parameters with examples and enums for fixed choices, and a compact,
# informative result. Prefer a few well-designed tools to many overlapping
# ones; make a tool do one job; return only what the model needs (ten fields,
# not a 50 KB JSON blob); and put hints in error messages ("customer_id must
# be a 6-digit string, got 'Anna'"). Test by reading the description as a
# stranger would: if you cannot tell which tool to pick, neither can the
# model.
#
# WHERE YOU USE IT
# Most tool-use failures are caused by ambiguous descriptions, overlapping
# tools and bloated results.
#
# RUN IT:  python 02_tools-1.py
#

schema = {
    "name": "search_orders",
    "description": "Find a customer's orders by customer id. Use before answering any question about delivery status.",
    "parameters": {
        "type": "object",
        "properties": {
            "customer_id": {"type": "string", "description": "6-digit id, e.g. '482913'"},
            "status": {"type": "string", "enum": ["open", "shipped", "returned"]},
        },
        "required": ["customer_id"],
    },
}
print(schema["name"], list(schema["parameters"]["properties"]), schema["parameters"]["required"])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# search_orders ['customer_id', 'status'] ['customer_id']
