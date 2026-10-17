# -*- coding: utf-8 -*-
# ==========================================================================
# Bar chart: which category is bigger? [matplotlib / Core chart types]
# ==========================================================================
# WHAT IT IS
# Use ax.bar(names, values) to compare quantities across separate categories;
# the bar height is the value. Bars should start at zero, because the eye
# compares lengths. Drag the bananas bar and notice how fast you spot the
# winner — no need to read the numbers.
#
# WHERE YOU USE IT
# Sales per product, error count per endpoint, accuracy per model, class sizes
# in a dataset — all categories compared.
#
# RUN IT:  python 03_chart-3.py
#

import matplotlib.pyplot as plt

fruits = ["Apples", "Bananas", "Oranges", "Grapes"]
units = [24, 36, 18, 12]

fig, ax = plt.subplots()
ax.bar(fruits, units, color="teal")
ax.set(title="Fruit Sold", ylabel="Units")
plt.show()
