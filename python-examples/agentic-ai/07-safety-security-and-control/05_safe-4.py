# -*- coding: utf-8 -*-
# ==========================================================================
# Irreversible actions, sandboxes and dry runs [agentic-ai / Safety, security
# and control]
# ==========================================================================
# WHAT IT IS
# Classify actions by reversibility. Reversible (create a draft, write to a
# scratch branch) can be automated; hard to reverse (send an e-mail, publish)
# need approval; irreversible (delete data, transfer money, change production)
# need approval plus safeguards: a dry run that shows what would happen, a
# soft delete with a recovery window, backups and a rollback plan. Run agent
# experiments in a sandbox copy of the data and systems first. Transactional
# design helps: collect the proposed changes, show them as one diff, apply
# them atomically after approval. A "plan then confirm" step turns many risky
# decisions into one reviewed decision.
#
# WHERE YOU USE IT
# If you cannot undo it, either do not automate it or make the agent ask.
#
# RUN IT:  python 05_safe-4.py
#

files = ["a.log", "b.log", "report.pdf"]
def cleanup(pattern, dry_run=True):
    targets = [f for f in files if f.endswith(pattern)]
    return ("would delete" if dry_run else "deleted"), targets

print(cleanup(".log"))
print(cleanup(".log", dry_run=False))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ('would delete', ['a.log', 'b.log'])
# ('deleted', ['a.log', 'b.log'])
