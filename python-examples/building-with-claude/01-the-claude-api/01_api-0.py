# -*- coding: utf-8 -*-
# ==========================================================================
# The Messages API: one request, one response [building-with-claude / The
# Claude API]
# ==========================================================================
# WHAT IT IS
# Everything starts with one HTTP call: POST /v1/messages with headers
# x-api-key and anthropic-version: 2023-06-01. The body needs three things:
# the model (for example claude-sonnet-5-5), max_tokens (the cap on generated
# tokens) and messages, a list of turns with a role (user or assistant) and
# content. The system prompt is a separate top-level system field — there is
# no "system" role inside messages. The response contains a list of content
# blocks (text, tool_use, …), a stop_reason (end_turn, max_tokens, tool_use,
# stop_sequence …) and a usage object with the token counts you are billed
# for.
#
# WHERE YOU USE IT
# The API is stateless: each request must carry the whole conversation you
# want the model to see.
#
# RUN IT:  python 01_api-0.py
#

import json

request = {
    "model": "claude-sonnet-5-5",
    "max_tokens": 1024,
    "system": "You are a concise assistant for ACME support.",
    "messages": [{"role": "user", "content": "How do I reset my password?"}],
}
response = {
    "content": [{"type": "text", "text": "Open Settings > Security and choose Reset password."}],
    "stop_reason": "end_turn",
    "usage": {"input_tokens": 31, "output_tokens": 14},
}
print(json.dumps(request)[:90] + "...")
print(response["stop_reason"], response["usage"])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# {"model": "claude-sonnet-5-5", "max_tokens": 1024, "system": "You are a concise assistant ...
# end_turn {'input_tokens': 31, 'output_tokens': 14}
