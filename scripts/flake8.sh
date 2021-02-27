#!/usr/bin/env sh

poetry run flake8 --show-source --statistics server/ tests/
