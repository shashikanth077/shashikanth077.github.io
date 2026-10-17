# -*- coding: utf-8 -*-
# ==========================================================================
# Privacy, copyright and responsible use [generative-ai / Cost, latency,
# safety and shipping]
# ==========================================================================
# WHAT IT IS
# Know where data goes. Sending text to an API shares it with the provider:
# read the retention and training terms, use enterprise or zero-retention
# options for sensitive data, and mask personal information first (names,
# e-mails, ID numbers). Training data and generated text raise copyright and
# licence questions: check your provider's indemnities, avoid asking for
# verbatim reproduction, keep records of sources for retrieved content and
# respect robots and licences when you crawl. Be transparent with users that
# they are talking to an AI, give them a way to reach a human, and watch for
# bias: evaluate quality across languages, dialects and groups. Training and
# serving also consume energy — right-sizing the model is part of responsible
# design.
#
# WHERE YOU USE IT
# Involve legal, security and the affected users early, not after launch.
#
# RUN IT:  python 05_ops-4.py
#

checklist = {
    "data retention terms reviewed": True,
    "personal data masked": True,
    "provider does not train on our data": False,
    "users told they talk to an AI": True,
}
print([k for k, ok in checklist.items() if not ok])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ['provider does not train on our data']
