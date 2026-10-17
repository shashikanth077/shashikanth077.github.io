# -*- coding: utf-8 -*-
# ==========================================================================
# Creating, reading and updating lists [python-ai / Lists]
# ==========================================================================
# WHAT IT IS
# A list is an ordered, mutable collection written with square brackets. Read
# an item with items[i], change it with items[i] = x. Duplicates are allowed
# and items can mix types. "Mutable" means the same list object can change
# after it is created.
#
# WHERE YOU USE IT
# A list is the first container for predictions, labels, pixel values or a
# batch of texts before they become arrays.
#
# RUN IT:  python 01_lists-0.py
#

basket = ["milk", "bread", "apple"]
print(basket[0])
print(basket[-1])
basket[1] = "rice"
print(basket)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# milk
# apple
# ['milk', 'rice', 'apple']
