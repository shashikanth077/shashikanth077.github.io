# -*- coding: utf-8 -*-
# ==========================================================================
# Parameters: positional, keyword and default [python-ai / Functions]
# ==========================================================================
# WHAT IT IS
# Positional arguments match by order, keyword arguments by name, and defaults
# fill in whatever the caller leaves out. Put required parameters first.
# Keyword arguments make calls self-documenting.
#
# WHERE YOU USE IT
# Almost every ML API is keyword-heavy: train(epochs=20, lr=0.001). Defaults
# give sensible behaviour while you tune only what matters.
#
# RUN IT:  python 03_funcs-2.py
#

def greet(name, language="English"):
    if language == "Lithuanian":
        return f"Labas, {name}!"
    return f"Hello, {name}!"

print(greet("Ravi"))
print(greet("Asha", language="Lithuanian"))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# Hello, Ravi!
# Labas, Asha!
