# -*- coding: utf-8 -*-
# ==========================================================================
# Code review and quality gates with agents [building-with-claude / Using
# assistants in development and research]
# ==========================================================================
# WHAT IT IS
# A review agent is a read-only custom agent (or subagent) that checks changes
# against a checklist: correctness, error handling, tests, security
# (injection, secrets, unsafe deserialisation), performance, naming and docs.
# Make findings actionable: file, line, severity, why, a suggested fix. Run it
# as a pre-review pass, never as a replacement for human approval; track
# precision — if half the comments are noise, tighten the checklist or drop
# them. Use multiple narrow reviewers (security, tests, docs) in parallel
# instead of one vague one. Combine with deterministic gates that need no
# model: CI tests, static analysis, dependency and secret scanning, branch
# protection.
#
# WHERE YOU USE IT
# Count how many agent findings were accepted: that precision number decides
# whether the agent stays.
#
# RUN IT:  python 02_dev-1.py
#

made, accepted = 40, 28
print(round(accepted / made, 2), "precision")
findings = [{"file": "app.py", "line": 42, "severity": "high", "why": "SQL built from user input", "fix": "use parameters"}]
print(findings[0])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.7 precision
# {'file': 'app.py', 'line': 42, 'severity': 'high', 'why': 'SQL built from user input', 'fix': 'use parameters'}
