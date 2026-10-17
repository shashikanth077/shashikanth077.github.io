# -*- coding: utf-8 -*-
# ==========================================================================
# Partitioning and keyed state [fraud-detection / Real-time serving]
# ==========================================================================
# WHAT IT IS
# Velocity features need the latest state of one card: its counters and recent
# events. To keep that state fast and correct at thousands of events a second,
# the stream is partitioned by key — typically the card id: a hash of the key
# picks a partition, and each partition is processed by exactly one worker.
# All events of one card go to the same worker in order, so its windows and
# counters live in that worker's local memory and no two workers fight over
# them. Add partitions (and workers) to scale; a hot key (one device used by
# thousands of cards) can overload a partition, so use secondary keys or
# pre-aggregation for those. The run shows the same card always landing on the
# same partition.
#
# WHERE YOU USE IT
# Choose the partition key from the entity whose state you need most (card),
# and run a second keyed pipeline for other entities (device, merchant) with
# their own state.
#
# RUN IT:  python 02_serve-2.py
#

import hashlib
PARTITIONS = 4

def partition(key):
    return int(hashlib.md5(key.encode()).hexdigest(), 16) % PARTITIONS    # stable across runs and machines

events = ["card_17", "card_42", "card_17", "card_99", "card_42", "card_17", "card_8", "card_99"]
for key in events:
    print(f"{key:<8} -> partition {partition(key)}")
counts = {}
for key in events:
    counts.setdefault(partition(key), set()).add(key)
print({p: sorted(keys) for p, keys in sorted(counts.items())})

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# card_17  -> partition 3
# card_42  -> partition 1
# card_17  -> partition 3
# card_99  -> partition 0
# card_42  -> partition 1
# card_17  -> partition 3
# card_8   -> partition 1
# card_99  -> partition 0
# {0: ['card_99'], 1: ['card_42', 'card_8'], 3: ['card_17']}
