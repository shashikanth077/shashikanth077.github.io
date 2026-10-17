# -*- coding: utf-8 -*-
# ==========================================================================
# Tool calling: the model asks, your code acts [agentic-ai / Tools and the
# Model Context Protocol]
# ==========================================================================
# WHAT IT IS
# A model cannot run code or browse the web by itself; it can only produce
# text. Tool calling gives it a way to ask: you describe each tool (name,
# purpose, parameters as a JSON schema); when the model decides a tool is
# needed it returns a structured request such as {"tool": "get_weather",
# "args": {"city": "Vilnius" instead of prose. Your program executes the
# function, and sends the result back as a message; the model continues with
# that observation. The model never touches your systems directly — your code
# is the gatekeeper, and everything the model "does" passes through functions
# you wrote and can check.
#
# WHERE YOU USE IT
# Tool results go back into the model's context as text: size, format and
# trustworthiness of that text matter.
#
# RUN IT:  python 01_tools-0.py
#

import json

registry = {"get_weather": lambda city: {"Vilnius": "4 C, cloudy"}.get(city, "unknown city")}
model_output = '{"tool": "get_weather", "args": {"city": "Vilnius"}}'
request = json.loads(model_output)
result = registry[request["tool"]](**request["args"])
print(request["tool"], "->", result)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# get_weather -> 4 C, cloudy
