# -*- coding: utf-8 -*-
# ==========================================================================
# get() versus [] and KeyError [python-ai / Dictionaries]
# ==========================================================================
# WHAT IT IS
# d[key] raises KeyError when the key is missing. d.get(key, default) returns
# the default instead, and key in d just checks. Use square brackets for
# required fields (so a bug is loud) and get for optional ones.
#
# WHERE YOU USE IT
# Real data is messy: optional JSON fields and missing columns. get keeps a
# pipeline running; [] makes a required-field bug obvious.
#
# RUN IT:  python 02_dicts-1.py
#

user = {"name": "Asha"}
print(user.get("phone", "Not provided"))
print("phone" in user)
print(user["phone"])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# Not provided
# False
# KeyError: 'phone'
