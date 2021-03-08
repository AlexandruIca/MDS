#!/usr/bin/env sh

cd server/

poetry run uvicorn main:app --port=5634 --ws=websockets
