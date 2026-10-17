# -*- coding: utf-8 -*-
# ==========================================================================
# GitHub Models: retired on 30 July 2026 [building-with-claude / Providers,
# portability and GitHub Models]
# ==========================================================================
# WHAT IT IS
# A note first: GitHub Models — the hosted model catalogue, playground and
# inference API that let developers try and call models with a GitHub token —
# was fully retired on 30 July 2026; its playground, model catalogue,
# inference API and bring-your-own-key option are no longer available to
# anyone. GitHub's changelog points to Microsoft Foundry for a broad model
# catalogue and to GitHub Copilot for AI workflows on GitHub. Code that called
# the old inference endpoint (including GitHub Spark's llm() function) must
# move to another provider. This is why a track about building with models
# should teach portability: model services come and go, so isolate the
# provider behind your own interface.
#
# WHERE YOU USE IT
# Check the "last updated" date of tutorials: anything that tells you to call
# GitHub Models with a personal access token is out of date.
#
# RUN IT:  python 01_models-0.py
#

timeline = [("2026-07-01", "retirement announced"), ("2026-07-16", "brownout"), ("2026-07-23", "brownout"), ("2026-07-30", "fully retired")]
for date, event in timeline:
    print(date, event)
migration = ["find every call to the old inference endpoint", "choose a provider (Foundry, a direct API, Copilot features)", "swap behind an interface", "re-run your evaluation set"]
print(len(migration), "steps")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 2026-07-01 retirement announced
# 2026-07-16 brownout
# 2026-07-23 brownout
# 2026-07-30 fully retired
# 4 steps
