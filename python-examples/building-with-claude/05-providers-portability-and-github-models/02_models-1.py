# -*- coding: utf-8 -*-
# ==========================================================================
# Staying portable across model providers [building-with-claude / Providers,
# portability and GitHub Models]
# ==========================================================================
# WHAT IT IS
# Treat the model as a replaceable dependency. Put calls behind a small
# interface of your own — complete(messages, tools, settings) → result with
# text, tool calls and usage — and keep provider details (endpoint, model id,
# authentication, request shape) in one adapter and in configuration. Keep
# prompts and tool schemas in files, not scattered strings; keep an evaluation
# set that can be run against any adapter; log tokens and cost in one format.
# Differences you must still handle: how system prompts and tools are
# expressed, token pricing and limits, streaming events, supported features
# (caching, batch, thinking). Test fallbacks, because a backup provider you
# never ran will not work on the day you need it.
#
# WHERE YOU USE IT
# Portability is not zero cost: use provider-specific features (caching,
# batch) deliberately, behind the interface.
#
# RUN IT:  python 02_models-1.py
#

class FakeClaude:
    def complete(self, messages):
        return {"text": "claude says hi", "usage": {"in": 20, "out": 5}}

class FakeOther:
    def complete(self, messages):
        return {"text": "other says hi", "usage": {"in": 22, "out": 6}}

def run(provider, messages):
    out = provider.complete(messages)
    return out["text"], out["usage"]

for name, p in {"claude": FakeClaude(), "other": FakeOther()}.items():
    print(name, run(p, [{"role": "user", "content": "hi"}]))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# claude ('claude says hi', {'in': 20, 'out': 5})
# other ('other says hi', {'in': 22, 'out': 6})
