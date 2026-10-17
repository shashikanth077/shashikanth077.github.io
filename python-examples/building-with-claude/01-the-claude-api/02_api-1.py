# -*- coding: utf-8 -*-
# ==========================================================================
# Choosing a model: capability, speed and price [building-with-claude / The
# Claude API]
# ==========================================================================
# WHAT IT IS
# Current Claude models share a 1M-token context window and up to 128K output
# tokens; they differ in intelligence, speed and price (per million tokens,
# from the pricing page on 2026-10-16): Fable 5.1 $10 input / $50 output —
# demanding reasoning and long-horizon agentic work; Opus 5.5 $4 / $20 —
# long-running agentic coding and knowledge work, the suggested starting
# point; Sonnet 5.5 $2 / $10 — the best mix of speed and intelligence; Haiku
# 5.5 from $0.10 / $0.50 — high-volume, latency-sensitive classification,
# extraction and routing. Pick by evaluating on your own task: start with a
# strong model to find out what is possible, then try cheaper ones.
#
# WHERE YOU USE IT
# Model IDs are pinned snapshots: new capabilities arrive as new IDs, so plan
# a migration path and re-run your evaluations.
#
# RUN IT:  python 02_api-1.py
#

prices = {  # USD per million tokens (input, output) as listed on 2026-10-16
    "claude-fable-5-1": (10.0, 50.0),
    "claude-opus-5-5": (4.0, 20.0),
    "claude-sonnet-5-5": (2.0, 10.0),
    "claude-haiku-5-5": (0.10, 0.50),
}
def cost(model, tin, tout):
    pin, pout = prices[model]
    return tin / 1e6 * pin + tout / 1e6 * pout

for m in prices:
    print(f"{m:18s} {cost(m, 2000, 500):.5f} per request (2,000 in / 500 out)")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# claude-fable-5-1   0.04500 per request (2,000 in / 500 out)
# claude-opus-5-5    0.01800 per request (2,000 in / 500 out)
# claude-sonnet-5-5  0.00900 per request (2,000 in / 500 out)
# claude-haiku-5-5   0.00045 per request (2,000 in / 500 out)
