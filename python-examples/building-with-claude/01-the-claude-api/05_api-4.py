# -*- coding: utf-8 -*-
# ==========================================================================
# Streaming: show tokens as they arrive [building-with-claude / The Claude
# API]
# ==========================================================================
# WHAT IT IS
# A long answer can take many seconds. With streaming (stream: true) the API
# sends the response as server-sent events while it is generated, so the user
# sees the first words almost at once. The event sequence is, in simplified
# form: message_start → content_block_start → a series of content_block_delta
# events carrying text pieces → content_block_stop → message_delta
# (stop_reason and final usage) → message_stop. Your client concatenates the
# text deltas. Perceived latency becomes the time to first token, not the
# total time: a 500-token answer at 50 tokens/s takes 10 s in total but starts
# after well under a second. Handle partial JSON carefully when streaming tool
# inputs, and be ready for mid-stream errors.
#
# WHERE YOU USE IT
# Always stream user-facing answers longer than a sentence or two; keep
# non-streaming calls for back-end jobs.
#
# RUN IT:  python 05_api-4.py
#

events = [
    {"type": "message_start"},
    {"type": "content_block_start", "index": 0},
    {"type": "content_block_delta", "index": 0, "delta": {"type": "text_delta", "text": "Open "}},
    {"type": "content_block_delta", "index": 0, "delta": {"type": "text_delta", "text": "Settings."}},
    {"type": "content_block_stop", "index": 0},
    {"type": "message_delta", "delta": {"stop_reason": "end_turn"}, "usage": {"output_tokens": 4}},
    {"type": "message_stop"},
]
text = "".join(e["delta"]["text"] for e in events if e["type"] == "content_block_delta")
print(repr(text))
ttft, tps, n = 0.6, 50, 500
print(ttft + n / tps, "s total;", ttft, "s until the first word")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 'Open Settings.'
# 10.6 s total; 0.6 s until the first word
