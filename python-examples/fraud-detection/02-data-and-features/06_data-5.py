# -*- coding: utf-8 -*-
# ==========================================================================
# Linking devices, cards and people [fraud-detection / Data and features]
# ==========================================================================
# WHAT IT IS
# Fraudsters reuse infrastructure: one phone, browser fingerprint, shipping
# address or IP is shared by many stolen cards or fake accounts. Treat
# entities as a graph: nodes are cards, devices, emails, addresses; an edge
# means "seen together". Features then ask graph questions: how many distinct
# cards has this device used today? How big is the connected cluster this
# account belongs to, and is any member already known-bad? Connected
# components (union-find) or a few hops of neighbourhood statistics are cheap
# enough to pre-compute near-real-time; heavier graph neural networks are
# usually a batch tool. Linking also needs care: a shared family computer or
# office Wi-Fi creates innocent links.
#
# WHERE YOU USE IT
# Cap hub nodes (a public Wi-Fi IP linked to thousands of people) so they do
# not poison cluster features.
#
# RUN IT:  python 06_data-5.py
#

# union-find: group cards that share a device
parent = {}
def find(x):
    parent.setdefault(x, x)
    while parent[x] != x:
        parent[x] = parent[parent[x]]
        x = parent[x]
    return x
def union(a, b):
    parent[find(a)] = find(b)

seen = [("card1", "devA"), ("card2", "devA"), ("card3", "devA"), ("card3", "devB"), ("card4", "devB"), ("card5", "devC")]
for card, dev in seen:
    union(card, dev)
groups = {}
for node in parent:
    groups.setdefault(find(node), []).append(node)
for members in sorted(groups.values(), key=len, reverse=True):
    cards = sorted(m for m in members if m.startswith("card"))
    print(len(cards), "cards linked:", cards)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 4 cards linked: ['card1', 'card2', 'card3', 'card4']
# 1 cards linked: ['card5']
