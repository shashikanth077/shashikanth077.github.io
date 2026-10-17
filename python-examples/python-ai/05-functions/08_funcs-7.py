# -*- coding: utf-8 -*-
# ==========================================================================
# Type hints and docstrings [python-ai / Functions]
# ==========================================================================
# WHAT IT IS
# Type hints — scores: list[float], -> float — document what a function
# expects and returns. Editors and checkers such as mypy use them, but Python
# does not enforce them at runtime. A docstring is a triple-quoted first line
# that explains the function and appears in help().
#
# WHERE YOU USE IT
# ML codebases are big and collaborative. Hints and docstrings tell the next
# person what type and shape X should have.
#
# RUN IT:  python 08_funcs-7.py
#

def average(scores: list[float]) -> float:
    """Return the average of a non-empty list of scores."""
    return sum(scores) / len(scores)

print(average([70, 80, 90]))
print(average.__doc__)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 80.0
# Return the average of a non-empty list of scores.
