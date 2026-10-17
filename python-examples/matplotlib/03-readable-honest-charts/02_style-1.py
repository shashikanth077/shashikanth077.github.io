# -*- coding: utf-8 -*-
# ==========================================================================
# Colours, markers and line styles [matplotlib / Readable, honest charts]
# ==========================================================================
# WHAT IT IS
# Every ax.plot accepts color, linestyle, linewidth and marker. Colours can be
# names ("teal"), hex codes ("#1f77b4") or one letter ("r"). There is also a
# compact format string: "o--r" means circle markers, dashed line, red. Use
# colour to separate series, but never rely on colour alone — vary the line
# style or marker too.
#
# WHERE YOU USE IT
# About one in twelve men has colour-vision deficiency. Combine colour with
# markers or dashes so a printed or greyscale chart still works.
#
# RUN IT:  python 02_style-1.py
#

import matplotlib.pyplot as plt

fig, ax = plt.subplots()
line, = ax.plot([1, 2, 3], [2, 4, 3], color="crimson", linestyle="--", marker="s", linewidth=2)
ax.plot([1, 2, 3], [1, 3, 5], "o:g")        # format string: circle, dotted, green
plt.show()
print(line.get_color(), line.get_linestyle(), line.get_marker())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# crimson -- s
