"""Supplied preview program: prints what the configured service would display (no instances are created)."""
import configparser
import sys

config = configparser.ConfigParser()
config.read(sys.argv[1], encoding="utf-8")
section = config["deployment"]
print("Preview notice: " + section["notice"])
print("Planned replicas: " + section["replicas"] + " (planned count only; nothing is started)")
print("Environment: " + section["environment"])
