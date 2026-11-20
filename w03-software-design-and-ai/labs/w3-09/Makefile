# w3-09 lab commands - run from this lab directory. Each target is a thin wrapper around check.py,
# so Windows users without make can run the same thing:  python check.py <target>
PYTHON ?= python3

.PHONY: test demo view view-demo

test:
	$(PYTHON) check.py starter

demo:
	$(PYTHON) check.py demo

view:
	$(PYTHON) launch.py starter

view-demo:
	$(PYTHON) launch.py demo
