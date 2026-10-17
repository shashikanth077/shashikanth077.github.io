# -*- coding: utf-8 -*-
# ==========================================================================
# Research workflows with assistants [building-with-claude / Using assistants
# in development and research]
# ==========================================================================
# WHAT IT IS
# Assistants speed up research when you keep control of the evidence. Useful
# patterns: triage (summarise 50 abstracts and rank by relevance to a stated
# question), extraction (pull methods, datasets and numbers into a table with
# page references), comparison (differences between two methods), drafting (an
# outline or related-work section from sources you supply) and code for
# analysis. Rules: give the model the documents rather than relying on memory;
# require quotes or citations with locations and check a sample against the
# source; never cite a paper you have not opened (models can invent plausible
# references); record which tool, model and prompt produced each summary; and
# keep your own judgement for interpretation and claims.
#
# WHERE YOU USE IT
# Verify every reference exists and says what is claimed before it enters a
# paper or report.
#
# RUN IT:  python 03_dev-2.py
#

cited = ["Smith 2021", "Doe 2019", "Roe 2024"]
opened = {"Smith 2021", "Roe 2024"}
unverified = [c for c in cited if c not in opened]
print("not yet verified:", unverified)
sample = 10
checked_correct = 9
print(checked_correct / sample, "= share of sampled summaries that matched the source")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# not yet verified: ['Doe 2019']
# 0.9 = share of sampled summaries that matched the source
