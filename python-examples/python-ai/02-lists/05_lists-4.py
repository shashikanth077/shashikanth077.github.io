# -*- coding: utf-8 -*-
# ==========================================================================
# Copy versus alias [python-ai / Lists]
# ==========================================================================
# WHAT IT IS
# b = a does not copy a list: both names point at the same object, so a change
# through one shows up through the other. a.copy() or a[:] makes a shallow
# copy (nested lists are still shared); copy.deepcopy(a) makes a fully
# independent one.
#
# WHERE YOU USE IT
# Mutating a shared list "just to try something" silently corrupts the
# original data you later evaluate on.
#
# RUN IT:  python 05_lists-4.py
#

a = [1, 2, 3]
b = a
c = a.copy()
b.append(4)
print(a)
print(c)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [1, 2, 3, 4]
# [1, 2, 3]
