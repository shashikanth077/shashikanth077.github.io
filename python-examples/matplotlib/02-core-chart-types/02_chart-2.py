# -*- coding: utf-8 -*-
# ==========================================================================
# Several lines and a legend [matplotlib / Core chart types]
# ==========================================================================
# WHAT IT IS
# Call ax.plot once per series and give each a label="…"; then ax.legend()
# turns those labels into a key. Without labels the legend is empty and the
# reader cannot tell the lines apart. Use the same x-values so the series are
# comparable.
#
# WHERE YOU USE IT
# Train versus validation loss, this week versus last week, model A versus
# model B — comparison charts are mostly two or three labelled lines.
#
# RUN IT:  python 02_chart-2.py
#

import matplotlib.pyplot as plt

days = [1, 2, 3, 4, 5, 6, 7]
this_week = [4000, 6000, 5500, 7500, 9000, 11000, 8500]
last_week = [3500, 4200, 5000, 5200, 6100, 7000, 7200]

fig, ax = plt.subplots()
ax.plot(days, this_week, marker="o", label="This week")
ax.plot(days, last_week, marker="s", label="Last week")
ax.set(title="Steps per day", xlabel="Day", ylabel="Steps")
ax.legend()
plt.show()
print([line.get_label() for line in ax.lines])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ['This week', 'Last week']
