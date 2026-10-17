# -*- coding: utf-8 -*-
# ==========================================================================
# Choosing among many tools [agentic-ai / Tools and the Model Context
# Protocol]
# ==========================================================================
# WHAT IT IS
# With 5–10 well-separated tools a model chooses well; with 100 the
# descriptions alone fill the context and accuracy drops. Options: route first
# (a cheap classifier or the model picks a category, then only that category's
# tools are shown); retrieve tools by embedding the request and the tool
# descriptions and exposing the top 5–8; group related operations into fewer
# tools with an "action" parameter; and use sub-agents specialised for a
# domain. If 80 tools of 150 tokens each are listed, that is 12,000 tokens of
# descriptions on every step — retrieving the top 6 costs 900.
#
# WHERE YOU USE IT
# Measure tool-selection accuracy on a labelled set of requests: it is the
# first thing to degrade as tools multiply.
#
# RUN IT:  python 08_tools-7.py
#

import numpy as np

n_tools, tokens_each = 80, 150
print(n_tools * tokens_each, 6 * tokens_each)
tools = {"search_orders": [0.9, 0.1], "refund": [0.8, 0.3], "weather": [0.1, 0.9], "translate": [0.2, 0.8]}
q = np.array([0.85, 0.2])
cos = lambda a, b: float(np.dot(a, b) / np.linalg.norm(a) / np.linalg.norm(b))
ranked = sorted(tools, key=lambda t: -cos(q, np.array(tools[t])))
print(ranked[:2])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 12000 900
# ['search_orders', 'refund']
