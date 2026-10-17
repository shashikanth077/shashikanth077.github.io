# -*- coding: utf-8 -*-
# ==========================================================================
# Code execution as a tool [agentic-ai / Tools and the Model Context Protocol]
# ==========================================================================
# WHAT IT IS
# Letting an agent write and run code is powerful: exact arithmetic, data
# analysis, file conversion, tests. It is also the riskiest tool. Run
# model-written code only in a sandbox: an isolated container or virtual
# machine with no access to secrets, a read-only or scratch file system, no or
# restricted network, CPU, memory and time limits, and automatic clean-up.
# Capture stdout, stderr and any files as the observation, truncated to a
# sensible size. Never pass model output to your own interpreter's eval, to a
# shell with your credentials or to a production database. Treat the sandbox
# boundary as the security perimeter.
#
# WHERE YOU USE IT
# A coding agent's safety comes mostly from what the environment allows, not
# from the model's good intentions.
#
# RUN IT:  python 06_tools-5.py
#

limits = {"timeout_s": 10, "memory_mb": 512, "network": False, "writable": "/tmp/scratch only", "secrets": "none mounted"}
code = "print(sum(range(10)))"
output = "45\n"
print(limits)
print(repr(output[:2000]))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# {'timeout_s': 10, 'memory_mb': 512, 'network': False, 'writable': '/tmp/scratch only', 'secrets': 'none mounted'}
# '45\n'
