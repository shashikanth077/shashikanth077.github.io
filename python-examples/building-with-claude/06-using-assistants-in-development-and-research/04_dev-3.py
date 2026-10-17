# -*- coding: utf-8 -*-
# ==========================================================================
# Security of AI-assisted development [building-with-claude / Using assistants
# in development and research]
# ==========================================================================
# WHAT IT IS
# New tools bring new risks. Secrets: never paste keys into prompts; use
# secret scanners and pre-commit checks; keep credentials out of agent files.
# Untrusted content: text in issues, web pages and dependencies can contain
# instructions that steer an agent (prompt injection): run agents with least
# privilege and without production credentials, and require approval for
# network access and destructive commands. Dependencies: assistants sometimes
# suggest packages that do not exist; attackers register such names — always
# verify a package exists, is maintained and is the intended one before
# installing. Generated code: review it as you would a stranger's pull
# request. Data: know what leaves your machine and the retention terms of each
# service.
#
# WHERE YOU USE IT
# Run coding agents in a container or sandbox with a scoped token: assume one
# of them will eventually follow a malicious instruction.
#
# RUN IT:  python 04_dev-3.py
#

suggested = ["requests", "fastjson-utils-pro", "numpy"]
known_registry = {"requests", "numpy", "pandas"}
print([p for p in suggested if p not in known_registry], "need verification before installing")
env = {"GITHUB_TOKEN": "scoped:contents-read", "PROD_DB_URL": None}
print({k: v for k, v in env.items() if v})

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ['fastjson-utils-pro'] need verification before installing
# {'GITHUB_TOKEN': 'scoped:contents-read'}
