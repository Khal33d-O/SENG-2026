# w3-08 lab commands - run from this lab directory. Each target is a thin wrapper around check.py,
# so Windows users without make can run the same thing:  python check.py <target>
PYTHON ?= python3

.PHONY: test demo malformed

test:
	$(PYTHON) check.py starter

demo:
	$(PYTHON) check.py demo

malformed:
	$(PYTHON) check.py malformed
