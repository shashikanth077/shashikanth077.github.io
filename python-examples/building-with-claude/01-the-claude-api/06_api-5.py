# -*- coding: utf-8 -*-
# ==========================================================================
# Tool use: the request, the call and the result [building-with-claude / The
# Claude API]
# ==========================================================================
# WHAT IT IS
# You describe tools in the request (tools: name, description, an input_schema
# in JSON Schema). When Claude decides a tool is needed the response has
# stop_reason "tool_use" and one or more tool_use blocks containing an id, the
# tool name and the input arguments. Your code executes the tool and replies
# with a user message whose content has a tool_result block carrying the same
# tool_use_id. Claude then continues — possibly calling another tool. Client
# tools (your functions, plus Anthropic-schema tools such as bash and the text
# editor) run in your application; server tools (web search, web fetch, code
# execution) run on Anthropic's side and return results directly. Tool
# descriptions count as input tokens.
#
# WHERE YOU USE IT
# Return errors as tool_result content (is_error) so the model can recover
# instead of failing the whole request.
#
# RUN IT:  python 06_api-5.py
#

import json

tools = [{"name": "get_weather", "description": "Get the current weather for a city.",
          "input_schema": {"type": "object", "properties": {"city": {"type": "string"}}, "required": ["city"]}}]
messages = [{"role": "user", "content": "Weather in Vilnius?"}]
assistant = [{"type": "tool_use", "id": "toolu_01", "name": "get_weather", "input": {"city": "Vilnius"}}]
registry = {"get_weather": lambda city: f"4 C, cloudy in {city}"}
block = assistant[0]
result = registry[block["name"]](**block["input"])
messages += [{"role": "assistant", "content": assistant},
             {"role": "user", "content": [{"type": "tool_result", "tool_use_id": block["id"], "content": result}]}]
print(json.dumps(messages[-1]))
print(len(messages), "messages in the second request")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# {"role": "user", "content": [{"type": "tool_result", "tool_use_id": "toolu_01", "content": "4 C, cloudy in Vilnius"}]}
# 3 messages in the second request
