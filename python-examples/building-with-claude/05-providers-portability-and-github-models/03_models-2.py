# -*- coding: utf-8 -*-
# ==========================================================================
# Using Claude through cloud platforms [building-with-claude / Providers,
# portability and GitHub Models]
# ==========================================================================
# WHAT IT IS
# Claude is available directly from Anthropic and through cloud platforms,
# which matters for data residency, procurement and existing cloud
# commitments. The current models are offered on the Claude API, Amazon
# Bedrock, Google Cloud (Vertex AI), Microsoft Foundry and Claude Platform on
# AWS. Model identifiers differ: the Claude API uses claude-opus-5-5; Amazon
# Bedrock uses anthropic.claude-opus-5-5; Google Cloud and Microsoft Foundry
# use claude-opus-5-5 (Foundry deployments are named by you); Claude Platform
# on AWS uses the Claude API IDs. Features and rollout timing can differ by
# platform, so check the model page for the platform you use, and keep the ID
# in configuration.
#
# WHERE YOU USE IT
# Pick the platform for compliance and billing reasons, then test the exact
# features you depend on there.
#
# RUN IT:  python 03_models-2.py
#

ids = {
    "Claude API": "claude-opus-5-5",
    "Amazon Bedrock": "anthropic.claude-opus-5-5",
    "Google Cloud": "claude-opus-5-5",
    "Microsoft Foundry": "claude-opus-5-5 (deployment name you choose)",
    "Claude Platform on AWS": "claude-opus-5-5",
}
for platform, model_id in ids.items():
    print(f"{platform:24s} {model_id}")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# Claude API               claude-opus-5-5
# Amazon Bedrock           anthropic.claude-opus-5-5
# Google Cloud             claude-opus-5-5
# Microsoft Foundry        claude-opus-5-5 (deployment name you choose)
# Claude Platform on AWS   claude-opus-5-5
