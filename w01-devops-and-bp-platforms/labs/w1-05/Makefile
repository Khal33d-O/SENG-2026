# W1.05 make targets. ENGINE=podman selects the tested local alternative. Without make use the python3 commands.
ENGINE ?= docker
PYTHON ?= python3
.PHONY: guided baseline test-core test-changed prepare
prepare:      ## pull the pinned base (explicit download)
	$(PYTHON) lab.py prepare --engine $(ENGINE)
guided:       ## build and verify the complete guided recipe
	$(PYTHON) lab.py guided --engine $(ENGINE)
baseline:     ## the unedited starter must build and serve the NGINX welcome page
	$(PYTHON) lab.py baseline --engine $(ENGINE)
test-core:    ## Task 2
	$(PYTHON) lab.py test --variant core --tag localhost/academy-w105:core --engine $(ENGINE)
test-changed: ## Task 3
	$(PYTHON) lab.py test --variant changed --tag localhost/academy-w105:changed --engine $(ENGINE)
