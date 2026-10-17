# -*- coding: utf-8 -*-
# ==========================================================================
# Validate arguments, return errors as observations [agentic-ai / Tools and
# the Model Context Protocol]
# ==========================================================================
# WHAT IT IS
# Models make mistakes in arguments: wrong types, missing fields, invented
# ids. Validate every call before running it, and when it is invalid return
# the error as the tool result rather than crashing: the model can read it and
# correct itself on the next step. Keep the loop safe: limit the number of
# consecutive failures, never run arguments through eval or shell strings, and
# treat identifiers as untrusted until checked against your data. A call with
# {"customer_id": "Anna"} should produce "error: customer_id must be 6 digits"
# — and the agent then asks the user or searches by name.
#
# WHERE YOU USE IT
# Good error messages are cheap training signals at run time: they turn most
# first-try mistakes into second-try successes.
#
# RUN IT:  python 03_tools-2.py
#

import re

def search_orders(customer_id):
    if not re.fullmatch(r"\d{6}", str(customer_id)):
        return {"error": f"customer_id must be 6 digits, got {customer_id!r}"}
    return {"orders": ["A-100", "A-101"]}

print(search_orders("Anna"))
print(search_orders("482913"))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# {'error': "customer_id must be 6 digits, got 'Anna'"}
# {'orders': ['A-100', 'A-101']}
