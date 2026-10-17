# -*- coding: utf-8 -*-
# ==========================================================================
# Solving linear systems [maths-ai / Matrices]
# ==========================================================================
# WHAT IT IS
# A system such as x + y = 4 and x − y = 2 asks where two lines cross. Each
# equation is a line; the solution is their intersection. In matrix form it is
# A·v = e, solved by the inverse, v = A⁻¹e — if one exists. Parallel lines
# have no solution; identical lines have infinitely many.
#
# WHERE YOU USE IT
# Least-squares fitting and many closed-form ML solutions are linear systems.
#
# RUN IT:  python 05_mat-4.py
#

a, b, c, d = 1, 1, 1, -1      # x + y = 4  and  x - y = 2
e, f = 4, 2
det = a * d - b * c
x = (e * d - b * f) / det
y = (a * f - e * c) / det
print(x, y)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 3.0 1.0
