# W1.03 make targets (equivalent python commands are shown in README.md).
PYTHON ?= python3
WORK ?= ../w1-03-challenge

.PHONY: test smoke unit
test:   ## final verification of a workspace
	$(PYTHON) code/training.py verify --workspace "$(WORK)"
smoke:  ## baseline-only check; fails once you have changed the baseline
	$(PYTHON) code/training.py baseline --workspace "$(WORK)"
unit:   ## supplied parser/annotation interface tests
	$(PYTHON) -m unittest discover -s code/tests -v
