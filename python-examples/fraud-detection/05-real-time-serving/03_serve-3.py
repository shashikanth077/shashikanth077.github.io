# -*- coding: utf-8 -*-
# ==========================================================================
# Duplicates, retries and out-of-order events [fraud-detection / Real-time
# serving]
# ==========================================================================
# WHAT IT IS
# Networks retry and streams deliver at least once, so the same event can
# arrive twice; events can also arrive out of order, because different devices
# and systems are not perfectly in step. Both corrupt features if ignored: a
# duplicate doubles a velocity count; a late event updates a window that was
# already used for a decision. Defences: give every event a unique event id
# and drop repeats (idempotency); process by event time rather than arrival
# time; use a watermark — "we accept events up to 60 seconds late" — and route
# anything later to a separate correction path; make state updates idempotent
# so replaying the stream gives the same result. The run feeds six events
# through a deduplicating, watermark-aware processor.
#
# WHERE YOU USE IT
# Decide up front whether a late fraud signal should change a decision already
# made (usually not, but it should still update features and labels).
#
# RUN IT:  python 03_serve-3.py
#

events = [("e1", 100), ("e2", 105), ("e1", 100), ("e3", 90), ("e4", 130), ("e5", 20)]   # (event_id, event_time in seconds)
LATENESS = 60
seen, watermark = set(), 0
for event_id, ts in events:
    if event_id in seen:
        print(event_id, "-> duplicate, ignored")
        continue
    seen.add(event_id)
    late = ts < watermark - LATENESS
    watermark = max(watermark, ts)
    print(event_id, "->", "too late: send to the correction path" if late else "processed", f"(event time {ts}, watermark {watermark})")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# e1 -> processed (event time 100, watermark 100)
# e2 -> processed (event time 105, watermark 105)
# e1 -> duplicate, ignored
# e3 -> processed (event time 90, watermark 105)
# e4 -> processed (event time 130, watermark 130)
# e5 -> too late: send to the correction path (event time 20, watermark 130)
