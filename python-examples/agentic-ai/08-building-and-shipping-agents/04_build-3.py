# -*- coding: utf-8 -*-
# ==========================================================================
# Computer-use and browser agents [agentic-ai / Building and shipping agents]
# ==========================================================================
# WHAT IT IS
# Some agents operate software like a person: they see screenshots (or the
# page's accessibility tree), move the pointer, click, type and scroll —
# useful where no API exists. Typical loop: observe the screen, decide one
# action, execute it, observe again. Challenges: slow (one model call per
# action: 30 actions at 3 s each is 90 s), fragile (layout changes, pop-ups),
# and risky (it can click anything the user can). Safeguards: a dedicated
# browser profile with no saved passwords, an allow-list of sites, approval
# before purchases, sends or deletions, screenshots in the audit log, and
# treating page content as untrusted. Prefer a real API or tool whenever one
# exists.
#
# WHERE YOU USE IT
# Use computer-use agents as a last resort or for testing; an API is faster,
# cheaper and safer.
#
# RUN IT:  python 04_build-3.py
#

actions, seconds_per_action = 30, 3
print(actions * seconds_per_action, "seconds for a 30-action task")
page = "<button>Buy now</button> <a href='https://evil.example'>Click</a>"
allowed = {"shop.example"}
print("evil.example" in allowed)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 90 seconds for a 30-action task
# False
