# -*- coding: utf-8 -*-
# ==========================================================================
# Adding and removing items [python-ai / Lists]
# ==========================================================================
# WHAT IT IS
# append(x) adds at the end, insert(i, x) adds before position i,
# extend(items) adds many, remove(x) deletes the first match, and pop()
# removes and returns the last item (or the one at position i). They change
# the list in place and return None — except pop, which returns the removed
# item.
#
# WHERE YOU USE IT
# Collecting per-epoch losses with append and taking batches off a queue with
# pop are daily patterns in training code.
#
# RUN IT:  python 02_lists-1.py
#

basket = ["milk", "bread"]
basket.append("eggs")
basket.insert(1, "rice")
basket.remove("bread")
last = basket.pop()
print(basket, last)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ['milk', 'rice'] eggs
