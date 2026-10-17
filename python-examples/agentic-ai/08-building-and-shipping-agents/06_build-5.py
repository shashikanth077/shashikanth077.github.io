# -*- coding: utf-8 -*-
# ==========================================================================
# Choosing and shipping: a decision guide [agentic-ai / Building and shipping
# agents]
# ==========================================================================
# WHAT IT IS
# A practical order. (1) Can one prompt do it? Stop. (2) A fixed chain or
# workflow with a few model steps? Build that. (3) Do you need dynamic choices
# of tools or steps? Add a small agent with a tight tool set, step limit and
# budget. (4) Do sub-tasks parallelise or need different tools and
# permissions? Consider multiple agents. At every stage: write the evaluation
# set first, log traces, add approvals for risky actions, and raise autonomy
# only as measured reliability earns it. Good first agent projects have
# verifiable outcomes, reversible actions and tolerant users: code changes,
# data cleanup, research summaries, internal helpdesk lookups.
#
# WHERE YOU USE IT
# Ship the smallest useful agent, measure it, and widen its powers step by
# step.
#
# RUN IT:  python 06_build-5.py
#

ladder = ["single prompt", "prompt chain / workflow", "routing and parallel calls", "single agent with tools", "multiple agents"]
for rung, name in enumerate(ladder):
    print(rung, name)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0 single prompt
# 1 prompt chain / workflow
# 2 routing and parallel calls
# 3 single agent with tools
# 4 multiple agents
