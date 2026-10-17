# -*- coding: utf-8 -*-
# ==========================================================================
# Thinking and effort: how hard the model works [building-with-claude / The
# Claude API]
# ==========================================================================
# WHAT IT IS
# Current Claude models can reason before answering. Adaptive thinking lets
# the model decide how much to think, steered by the effort parameter (low,
# medium, high, with higher levels on some models). Defaults on the API: Fable
# 5.1 and Sonnet 5.5 use high effort, Opus 5.5 and Haiku 5.5 use medium; you
# can set it explicitly. More thinking means more output tokens (billed), more
# latency and usually better answers on hard problems. Use low effort for
# simple extraction and routing, higher effort for multi-step reasoning, code
# and planning, and measure the accuracy-versus-cost curve on your own tasks.
# The older manual "extended thinking" budget is deprecated or not accepted on
# newer models.
#
# WHERE YOU USE IT
# Tune effort before switching to a bigger model: it is the cheapest quality
# dial.
#
# RUN IT:  python 10_api-9.py
#

runs = {"low": (400, 0.62), "medium": (900, 0.78), "high": (2200, 0.86)}
for effort, (out_tokens, accuracy) in runs.items():
    cost = 2000 / 1e6 * 2 + out_tokens / 1e6 * 10
    print(f"{effort:6s} accuracy {accuracy:.2f}  cost {cost:.4f}  cost per correct {cost / accuracy:.4f}")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# low    accuracy 0.62  cost 0.0080  cost per correct 0.0129
# medium accuracy 0.78  cost 0.0130  cost per correct 0.0167
# high   accuracy 0.86  cost 0.0260  cost per correct 0.0302
