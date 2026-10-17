# -*- coding: utf-8 -*-
# ==========================================================================
# The shared class-variable trap [python-ai / Classes and objects (OOP)]
# ==========================================================================
# WHAT IT IS
# A variable defined in the class body belongs to the class and is shared by
# every instance. A mutable one — a list — therefore leaks between objects.
# Create per-object state in __init__ with self.members = [].
#
# WHERE YOU USE IT
# A model class with a shared list of losses would mix up the results of two
# models trained side by side.
#
# RUN IT:  python 11_oop-10.py
#

class Team:
    members = []          # shared by ALL instances

a = Team()
b = Team()
a.members.append("Asha")
print(b.members)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ['Asha']
